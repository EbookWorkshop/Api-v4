import { ICollector } from "../../ports/ICollector.js";
import { RULE_INDEX, RULE_INFO, RuleName } from "../../../3-domain/constants/Rule.js"
import { COLLECT_EVENTS } from "../../../3-domain/constants/Event.js";
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

    /**
     * 
     * @param {Array<Object>} rules 
     * @param {IDataFetcher} fetcher 
     */
    constructor(rules, fetcher, services) {
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
     * @param {create|update} [payload.mode] 信息页
     */
    async fetch(setting, payload) {
        const { mode } = payload;
        this.#setting = setting;
        let result = {};
        if (mode === "create")
            result = await this.createBook(payload);
        else if (mode === "update")
            result = await this.updateChapter(payload);

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
            // console.log(result)
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
            ChapterList: chapterList
        };

        this.#fixData(bookResult);

        //存储到数据库
        const bookId = await this.#save(bookResult, { isEmbedBookName, sourcePage, infoPage });

        return this.#resultHandle(payload, bookId > 0, `已创建书籍《${bookResult.BookName}》`);
    }

    /**
     * 更新目录——更新章节数量，去重并合并
     * @param {*} option 
     */
    async updateChapter(option) {
        const { sourcePage, infoPage, isEmbedBookName, bookId } = option;
        //从页面获取的章节
        let chapterList = await this.#getChapterList(sourcePage);
        //已在数据库的章节
        const hasChaptList = await this.#webBookChapterService.getWebChapterURL(bookId, getHost(sourcePage));
        const keyDic = hasChaptList.map(t => `${t.WebTitle}${t["WebBookChapterURLs.Path"]}`);
        const bookResult = { [RuleName.ChapterList]: chapterList };
        this.#fixData(bookResult, new Set(keyDic));
        chapterList = bookResult[RuleName.ChapterList]
        if (chapterList.length > 0) await this.#saveBatchChapter(bookId, chapterList);

        return this.#resultHandle(option, true, `已完成章节合并，新增章节：${chapterList.length}`);
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
     * 获取章节列表
     * @param {string} sourcePage 来源网址
     * @param {Map<string,Object>} cpl 章节信息
     * @returns {Array<{text,url}>} 返回章节列表
     */
    async #getChapterList(sourcePage, cpl = new Map()) {
        const chapterList = [];
        const getResult = (resultMap) => {
            const __result = {
                nextPage: null,
                isRetry: false,
            }
            const cl = resultMap.get(RuleName.ChapterList);
            if (Error.isError(cl[0])) {
                __result.isRetry = true;
                return __result;
            }
            if (Array.isArray(cl)) chapterList.push(...cl);

            const np = resultMap.get(RuleName.IndexNextPage);
            if (np && np[0]) for (const nxp of np) {
                if (Error.isError(nxp)) {
                    __result.isRetry = true;
                    return __result;
                }
                if (nxp.text === nxp.Rule.checkSetting) __result.nextPage = nxp.url;
            }
            return __result;
        }
        let nextPage = null;
        if (cpl.size > 0) {
            const _rsl_ = getResult(cpl);
            if (_rsl_.isRetry) nextPage = sourcePage;
            else nextPage = _rsl_.nextPage;
        } else nextPage = sourcePage;

        let runTime = 0;
        while (nextPage && runTime <= 15) {
            const rslMap = await this.#fetcher.fetch(nextPage, this.#setting);
            const cycleRsl = getResult(rslMap);
            if (cycleRsl.isRetry) { runTime++; console.log(`获取内容失败，已重试：${runTime}。`, nextPage); continue; }
            nextPage = cycleRsl.nextPage;
        }

        return chapterList;
    }

    /**
     * 检查书本信息
     * 检查章节是否重复
     * @param {*} bookData 
     */
    #fixData(bookData, chapSet = new Set()) {
        //检查章节重复——依据【标题、网址】同时重复
        if (bookData[RuleName.ChapterList]) {
            const newChap = [];
            for (const c of bookData[RuleName.ChapterList]) {
                const key = `${c.text}${c.url}`;
                if (chapSet.has(key)) continue;
                newChap.push({ text: c.text, url: c.url });
                chapSet.add(key);
            }
            bookData[RuleName.ChapterList] = newChap;
        }
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