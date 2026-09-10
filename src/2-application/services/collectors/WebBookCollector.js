import { ICollector } from "../../ports/ICollector.js";
import { RULE_INDEX, RULE_INFO, RuleName } from "../../../3-domain/constants/Rule.js";
import { deduplicateByMultKey, difference } from "../../../5-shared/utils/array.js";
import { COLLECT_EVENTS } from "../../constants/Event.js";
import { AppError } from "../../../5-shared/errors/index.js";
import { getHost } from "../../../5-shared/utils/site.js";



export class WebBookCollector extends ICollector {
    #rules;
    /** @type {IDataFetcher} */
    #fetcher;
    #setting;
    #eventManager;
    #webBookService;
    #webBookChapterService;
    #coverService;

    constructor(config, rules, fetcher, services) {
        super();
        this.#rules = rules;
        this.#fetcher = fetcher;
        this.#eventManager = services.eventManager;
        this.#webBookService = services.webBookService;
        this.#webBookChapterService = services.webBookChapterService;
        this.#coverService = services.coverService;
        this.#coverService.dataFetcher = fetcher;
    }

    /**
     * 获取数据
     * @param {{ timeout, userAgent, dictionaries, rules }} setting 
     * @param {Object} payload 
     * @param {string} payload.sourcePage 索引页
     * @param {boolean} payload.isEmbedBookName 是否嵌入标题
     * @param {string} [payload.infoPage] 信息页
     * @param {create|update} [payload.mode] 任务类型
     */
    async fetch(setting, payload) {
        let result = {};
        try {
            const { mode } = payload;
            this.#setting = setting;
            if (mode === "create")
                result = await this.createBook(payload);
            else if (mode === "update")
                result = await this.updateChapter(payload);
        } catch (error) {
            const _error = {
                name: error.name || `失败任务：${taskType}`,
                message: error.message || '',
                stack: error.stack || '',
            }
            return this.#resultHandle(payload, { error: _error, ...payload }, `采集执行失败`);
        }
        return result;
    }


    /**
     * 创建网文——从网址到完整结构数据
     * @param {*} payload 
     * @returns 
     */
    async createBook(payload) {
        const { sourcePage, infoPage, isEmbedBookName } = payload;
        let urlPage = sourcePage;
        if (infoPage) urlPage = infoPage;
        const result = await this.#fetcher.fetch(urlPage, this.#setting);
        const info = new Map();
        RULE_INFO.map(r => info.set(r, result.get(r)));
        const infoResult = await this.#handleInfo(info, isEmbedBookName);
        if (!infoResult) {
            // console.log("书籍信息处理失败：", infoResult, info);
            return this.#resultHandle(payload, false, `书籍信息采集失败(一般是目标网站返回超时页)：${urlPage}`);
        }

        //采集/提取章节列表
        let cpl = new Map();
        RULE_INDEX.map(r => cpl.set(r, result.get(r)));
        if (infoPage) cpl = await this.#fetcher.fetch(sourcePage, this.#setting);
        const chapList = cpl.get(RuleName.ChapterList);
        if (!chapList || chapList.length <= 0) return this.#resultHandle(payload, false, "章节列表采集失败，没有章节信息：" + sourcePage);

        const chapterList = await this.#getChapterList(sourcePage, cpl);

        const bookResult = {
            ...infoResult,
            ChapterList: deduplicateByMultKey(chapterList, ["text", "url"]),
        };

        //存储到数据库
        const bookId = await this.#save(bookResult, { isEmbedBookName, sourcePage, infoPage });

        return this.#resultHandle(payload, { bookId, bookName: bookResult.BookName }, `已创建书籍《${bookResult.BookName}》`);
    }

    /**
     * 更新目录——更新章节数量，去重并合并
     * @param {*} option 
     */
    async updateChapter(option) {
        const { sourcePage, infoPage, bookId, bookName } = option;
        //从页面获取的章节
        let chapterList = await this.#getChapterList(sourcePage);
        if (chapterList.length === 0) {
            return this.#resultHandle(option, { error: true, ...option }, `从地址采集数据失败：${sourcePage}。`);
        }
        chapterList = deduplicateByMultKey(chapterList, ["text", "url"]);//同目录内自我去重

        //【新数据：chapterList】与【已在数据库的数据:hasChaptList】 进行差集计算
        const hasChaptList = await this.#webBookChapterService.findChapterWithURL(bookId);
        if (hasChaptList.length > 0) {
            //判断是否同源，如果是则将url也加入比较
            const curHost = getHost(sourcePage);
            let testCount = Math.min(hasChaptList.length, 800);
            const tempURLs = hasChaptList.slice(0, testCount).flatMap(t => t.urls);
            let diffSource = tempURLs.some(u => !u.includes(curHost));
            let excludeChapters = hasChaptList.map(({ title, urls }) => ({ text: title, urls }));
            const key = ["text"];           //不同源下的比较
            if (!diffSource) {             //同源情况下的比较
                key.push("url");
                excludeChapters = excludeChapters.map(({ text, urls }) => ({ text, url: urls[0] }));
            }
            //求差集
            chapterList = difference(chapterList, excludeChapters, key);
        }

        //去重后的结果
        if (chapterList.length > 0) await this.#saveBatchChapter(bookId, chapterList);
        return this.#resultHandle(option, { ...option, addedCount: chapterList.length }, `已完成章节合并，新增章节：${chapterList.length}`);
    }

    /**
     * 处理书籍的主要信息
     * @param {*} infoResult 
     * @returns 
     */
    async #handleInfo(infoResult, embedBookName) {
        const bn = infoResult.get(RuleName.BookName);
        if (!bn || !bn[0].text) return false;

        const bookInfo = {};
        for (const k of infoResult.keys()) {
            const rsl = infoResult.get(k);
            if (!rsl || !rsl[0].text) continue;
            bookInfo[k] = rsl[0].text;
        }
        //书名删除括号部分
        const indexOf = bookInfo[RuleName.BookName].search(/[（【『{\[(]/);
        if (indexOf >= 0) {
            let bookName = bookInfo[RuleName.BookName];
            if (indexOf == 0) {//括号在开头部分
                indexOf = bookName.search(/[）】』}\])]/);
                if (indexOf >= 0) bookName = bookName.substring(indexOf);
            } else {//左括号在中间
                bookName = bookName.substring(0, indexOf);
            }
            bookInfo[RuleName.BookName] = bookName;
        }

        //处理作者
        if (bookInfo[RuleName.Author]?.startsWith("作者")) bookInfo[RuleName.Author] = bookInfo[RuleName.Author].replace(/作者[:：]/, "");
        if (bookInfo[RuleName.Introduction]?.startsWith("简介")) bookInfo[RuleName.Introduction] = bookInfo[RuleName.Introduction].replace(/简介[:：]/, "");

        //处理封面
        if (bookInfo[RuleName.BookCover]) {
            const coverRsl = await this.#coverService.storeCover({ source: bookInfo[RuleName.BookCover], embedBookName, bookName: bookInfo[RuleName.BookName] });
            bookInfo.CoverImg = coverRsl.coverValue;
            delete infoResult[RuleName.BookCover];
        }
        return bookInfo;
    }

    /**
     * 获取书籍章节列表（支持分页）
     * @param {string} sourcePage - 目录页 URL
     * @param {Map} [initialMap] - 若已从信息页获取过数据，可传入初始结果 Map
     * @returns {Promise<Array<{text: string, url: string}>>} 章节数组
     */
    async #getChapterList(sourcePage, initialMap = new Map()) {
        const chapters = [];
        let nextPageUrl = null;
        let currentUrl = sourcePage;
        let pageCount = 0;
        const MAX_PAGES = 50;           // 防止死循环
        const MAX_RETRIES = 3;          // 单页最大重试次数

        // 提取单页数据（返回章节列表和下一页链接）
        const extractPageData = (resultMap) => {
            const pageChapters = [];
            // 获取章节列表（过滤掉错误项）
            const rawChapters = resultMap.get(RuleName.ChapterList) || [];
            for (const item of rawChapters) {
                if (!(item instanceof Error) && item.text) {
                    pageChapters.push({ text: item.text, url: item.url });
                }
            }

            let nextUrl = null;
            const nextResults = resultMap.get(RuleName.IndexNextPage) || [];
            for (const item of nextResults) {
                if (item instanceof Error) continue;
                if (item.text === item.Rule?.checkSetting) {
                    nextUrl = item.url;
                    break;
                }
            }
            return { chapters: pageChapters, nextUrl };
        };

        // 处理初始传入的数据（如果有）
        if (initialMap.size > 0) {
            const { chapters: initChaps, nextUrl } = extractPageData(initialMap);
            chapters.push(...initChaps);
            nextPageUrl = nextUrl;
            // 若初始页无有效章节，则回退到 sourcePage 重新抓取
            if (initChaps.length === 0) {
                currentUrl = sourcePage;
            } else {
                currentUrl = nextPageUrl;   // 继续从下一页开始
            }
        } else {
            currentUrl = sourcePage;
        }

        // 循环爬取后续页面
        while (currentUrl && pageCount < MAX_PAGES) {
            pageCount++;
            let success = false;
            let retries = 0;

            while (!success && retries < MAX_RETRIES) {
                try {
                    const resultMap = await this.#fetcher.fetch(currentUrl, this.#setting);
                    const { chapters: newChaps, nextUrl } = extractPageData(resultMap);

                    // 只要有新章节就算成功
                    if (newChaps.length > 0) {
                        chapters.push(...newChaps);
                        success = true;
                        nextPageUrl = nextUrl;
                    } else {
                        // 无章节数据，视为失败，重试
                        retries++;
                        console.warn(`页面 ${currentUrl} 未提取到章节，重试 ${retries}/${MAX_RETRIES}`);
                    }
                } catch (err) {
                    retries++;
                    console.warn(`抓取页面失败 ${currentUrl}，重试 ${retries}/${MAX_RETRIES}，错误：${err.message}`);
                }
            }
            // 若重试耗尽仍未成功，终止循环
            if (!success) {
                console.warn(`放弃页面 ${currentUrl}，已重试 ${MAX_RETRIES} 次`);
                break;
            }
            currentUrl = nextPageUrl;   // 移动到下一页
        }

        return chapters;
    }


    /**
     * 保存到数据库
     * @param {*} bookData 
     */
    async #save(bookData, option) {
        return await this.#webBookService.createBook(bookData, option);
    }

    async #saveBatchChapter(bookId, chapterList) {
        return this.#webBookChapterService.batchCreate(bookId, chapterList);
    }

    #resultHandle(payload, result, message) {
        const eventType = payload.mode == "create" ? COLLECT_EVENTS.CREATE_BOOK : COLLECT_EVENTS.UPDATE_INDEX;
        this.#eventManager.emitToMain(eventType, { result, message });

        // if (!result) throw new AppError(`执行失败：${message}`);
        return { ...payload, result, message };
    }
}