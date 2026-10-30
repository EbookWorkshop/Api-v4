import { ICollector } from "../../ports/ICollector.js";
import { RuleName } from "../../../3-domain/constants/Rule.js";
import { logger } from "../../../5-shared/logging/index.js";
import { AppError, normalizeError } from "../../../5-shared/errors/index.js";
import { COLLECT_EVENTS } from "../../constants/Event.js";
// import { getHost } from "../../../5-shared/utils/site.js";

const MAX_TRY_TIME = 250;

export class CrawlerCollector extends ICollector {
    // #rules;
    #fetcher;
    #setting;
    /** @type{import('../../events/CollectEventEmitter.js').CollectEventEmitter} */
    #emitter;
    #bookQueryService;
    #chapterQueryService;
    #webBookService;
    #webBookQueryService;
    /** @type{import('../../services/WebBookChapterService.js').WebBookChapterService} */
    #webBookChapterService;
    #webBookChapterURLService;

    #addChapt;

    constructor(config, rules, fetcher, services) {
        super(config, rules, fetcher, services);
        this.#fetcher = fetcher;
        this.#emitter = services.emitter;
        this.#bookQueryService = services.bookQueryService;
        this.#chapterQueryService = services.chapQueryServices;
        this.#webBookService = services.webBookService;
        this.#webBookQueryService = services.webBookQueryService;
        this.#webBookChapterService = services.webBookChapterService;
        this.#webBookChapterURLService = services.webBookChapterURLService;
    }

    /**
     * 获取数据
     * @param {{ timeout, userAgent, dictionaries, rules }} setting 
     * @param {Object} payload 
     * @param {string} [payload.url] 索引页
     * @param {string} [payload.bookName] 索引页
     * @param {number} [payload.bookId] 索引页
     */
    async fetch(setting, payload) {
        this.#setting = setting;
        this.#addChapt = [];
        const { rules } = setting;
        const { url, bookName, bookId } = payload;
        if (!rules.find(rule => rule.ruleName === RuleName.ChapterNextPage)) throw new AppError("规则【下一章】尚未配置。");
        if (!rules.find(rule => rule.ruleName === RuleName.ChapterTitle)) throw new AppError("规则【章节标题】尚未配置。");
        let curURL = url;

        try {
            let webbook = {};
            let book = {}
            //初始化书籍
            if (bookId) {
                book = await this.#bookQueryService.getBook(bookId);
                webbook = await this.#webBookQueryService.getWebBook(bookId);
                const sourceList = await this.#webBookQueryService.getBookSources(book.id);
                curURL = sourceList.find(i => i.Type === "chapter")?.Path ??
                    sourceList.find(i => i.defSource === true)?.Path ??
                    sourceList[0].Path;
            } else if (bookName) {
                const b = await this.#webBookService.findOrCreate(bookName, url);
                book = b.book;
                webbook = b.webbook;
            }

            payload.bookId = book.id;
            payload.bookName = book.BookName;
            // payload.sourcePage = curURL ?? url;

            let tryTime = 0
            while (curURL && tryTime++ < MAX_TRY_TIME) {
                const nextURL = await this.#fetchOneChapter(curURL, { bookId: book.id, webBookId: webbook.id });
                if (!nextURL || nextURL === curURL) break;
                curURL = nextURL;
                //记录最新地址
                await this.#webBookService.updateBookSource(webbook.id, curURL, "chapter");
            }

            // console.log(curURL);
        } catch (error) {
            return this.#failureHandle(payload, error, `爬虫执行失败：${error.message}—\n—${error.original?.message ?? ""}`);
        }

        return this.#successHandle(payload, this.#addChapt, `${bookName ? `添加书籍《${bookName}》,` : ""}已新增章节：${this.#addChapt.join("、")}`);
    }

    async #fetchOneChapter(url, { bookId, webBookId }) {
        let urlPage = url;
        const pageCtx = [];
        let chapTitle = "";
        let runTime = 0;
        do {
            const result = await this.#fetcher.fetch(urlPage, this.#setting, [RuleName.Content]);
            const ctx = result.get(RuleName.Content);
            if (!ctx || !ctx[0].text) { runTime++; logger.debug(`内容采集失败，重试${runTime}次：`, urlPage); continue; }
            const { text: content } = ctx[0];
            pageCtx.push(content);

            if (!chapTitle) {
                const title = result.get(RuleName.ChapterTitle)?.[0];
                chapTitle = title?.text;
            }

            const pg = result.get(RuleName.ContentNextPage)?.[0];
            if (pg?.name === 'Error' || pg instanceof Error) { runTime++; logger.debug(`内容采集失败，重试${runTime}次：`, urlPage); continue; }
            if (pg) {
                const { Rule: rule, text, url } = pg;
                if (text === rule.checkSetting) {
                    urlPage = url;
                    continue;
                }
            }
            const nextChap = result.get(RuleName.ChapterNextPage)?.[0];
            if (nextChap?.name === 'Error' || nextChap instanceof Error) { runTime++; logger.debug(`内容采集失败，重试${runTime}次：`, urlPage); continue; }
            if (nextChap.text === nextChap.Rule.checkSetting) {
                urlPage = nextChap.url;
                break;
            }
        } while (urlPage && runTime <= 15);//最大重试次数

        //存到数据库
        const data = await this.#webBookChapterURLService.queryByURL(url);
        if (data.length > 0) {
            let ids = data.map(i => i["WebBookChapter.IndexId"]);
            let bookData = await this.#chapterQueryService.getBookByChapterIds(ids);
            let bookIds = new Set(bookData.map(i => i.BookId));
            if (bookIds.has(bookId)) return urlPage;//已在本书存在重复，跳过存储
        }
        await this.#webBookChapterService.batchCreate(bookId, [{ text: chapTitle, url, order: -1, content: pageCtx.join("") }]);

        this.#addChapt.push(chapTitle);
        return urlPage;
    }

    /**
     * 提取当前 payload 的业务上下文
     */
    #resolveCtx(payload) {
        return {
            bookId: payload.bookId,
            bookName: payload.bookName,
            url: payload.url,
        };
    }

    #successHandle(payload, data, message) {
        const ctx = this.#resolveCtx(payload);
        this.#emitter?.success(COLLECT_EVENTS.CRAWLER_CHAPTER, { ctx, data, message });
        // 保留对上游的兼容返回：result 中保留 data，接收端已无需从此处拆包
        return { ...payload, result: data, message };
    }

    #failureHandle(payload, error, message) {
        const ctx = this.#resolveCtx(payload);
        if (error.parent) error = error.parent;
        else if (error.original) error = error.original
        const normalized = normalizeError(error);
        this.#emitter?.failure(COLLECT_EVENTS.CRAWLER_CHAPTER, { ctx, error: normalized, message });
        // 兼容返回：原代码此处的 result 里包含 error 字段供上游判错
        return { ...payload, result: { error: normalized }, message };
    }
}