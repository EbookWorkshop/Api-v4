import { RuleName } from "../../../3-domain/constants/Rule.js"
import { ICollector } from "../../ports/ICollector.js";
import { COLLECT_EVENTS } from "../../../3-domain/constants/Event.js"

export class ChapterCollector extends ICollector {
    #rules;
    #fetcher;
    #chapterQueryService;
    /** @type{ChapterCommandService} */
    #chapterCommandService;
    #eventManager;
    /**
     * 
     * @param {Array<Object>} rules 
     * @param {IDataFetcher} fetcher 
     * @param {*} services 
     */
    constructor(rules, fetcher, services) {
        super();
        this.#rules = rules;
        this.#fetcher = fetcher;
        this.#chapterQueryService = services.chapQueryServices;
        this.#chapterCommandService = services.chapCommaServices;
        this.#eventManager = services.eventManager;
    }

    async fetch(setting, payload) {
        const { bookId, chapterId, isUpdate } = payload;

        if (!isUpdate) {    //检查是否已覆盖更新
            const chapt = await this.#chapterQueryService.getChapterById(chapterId);
            if (chapt.Content?.length > 10) return this.#resultHandle(payload, false, `章节 ${chapterId} 已有内容，跳过更新。`);
        }

        const pageCtx = [];
        let urlPage = payload.url;
        let runTime = 0;
        do {
            const result = await this.#fetcher.fetch(urlPage, setting);
            const ctx = result.get(RuleName.Content);
            if (!ctx || !ctx[0].text) { runTime++; console.debug(`内容采集失败，重试${runTime}次：`, urlPage); continue; }
            const { text: content } = ctx[0];
            pageCtx.push(content);

            const pg = result.get(RuleName.ContentNextPage);
            if (Error.isError(pg[0])) { runTime++; console.debug(`内容采集失败，重试${runTime}次：`, urlPage); continue; }
            const { Rule: rule, text, url } = pg[0];
            if (text === rule.checkSetting) urlPage = url;
            else break;
        } while (urlPage && runTime <= 15);//最大重试次数
        const cont = pageCtx.some(t => !t);
        if (runTime >= 15 || cont) return this.#resultHandle({ ...payload, pageCtx }, false, "抓取的章节存在缺页。");

        await this.#chapterCommandService.upsertChapter({
            IndexId: chapterId,
            Content: pageCtx.join(""),
        });

        return this.#resultHandle(payload, true, "已完成章节采集");
    }

    #resultHandle(payload, result, message) {
        const { bookId, chapterId, url } = payload;
        this.#eventManager.emitToMain(COLLECT_EVENTS.UPDATE_CHAPTER, { bookId, chapterId, url, result, message });
        return { ...payload, result, message };
    }
}

