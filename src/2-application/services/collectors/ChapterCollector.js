import { RuleName } from "../../../3-domain/constants/Rule.js"
import { ICollector } from "../../ports/ICollector.js";
import { COLLECT_EVENTS } from "../../constants/Event.js"

export class ChapterCollector extends ICollector {
    #rules;
    #fetcher;
    #indexService
    /** @type{ChapterCommandService} */
    #chapterCommandService;
    #emitter;

    constructor(config, rules, fetcher, services) {
        super();
        this.#rules = rules;
        this.#fetcher = fetcher;
        this.#chapterCommandService = services.chapCommaServices;
        this.#emitter = services.emitter;
        this.#indexService = services.index;
    }

    async fetch(setting, payload) {
        const { bookId, chapterId, isUpdate } = payload;
        if (!isUpdate) {    //检查是否已覆盖更新
            const chapt = await this.#indexService.find(chapterId);
            if (chapt.IsHasContent) return this.#resultHandle(payload, true, `章节 ${chapterId} 已有内容，跳过更新。`);
        }
        this.#emitter.start(COLLECT_EVENTS.UPDATE_CHAPTER_START, {
            ctx: { chapterId },
            message: `开始更新章节 ${chapterId}`,
        });

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

    #resultHandle(payload, ok, message) {
        const { chapterId } = payload;
        const ctx = { chapterId };

        if (ok) {
            this.#emitter.success(COLLECT_EVENTS.UPDATE_CHAPTER, { ctx, message });
        } else {
            this.#emitter.failure(COLLECT_EVENTS.UPDATE_CHAPTER, {
                ctx,
                error: { message },
                message,
            });
        }

        // 保持对上游（Task 完成消息、Task.callback）的兼容返回
        return { payload, result: ok, message };
    }
}

