import { RuleName } from "../../../3-domain/constants/Rule.js"
import { ICollector } from "../../ports/ICollector.js";
import { COLLECT_EVENTS } from "../../constants/Event.js"
import { logger } from "../../../5-shared/logging/index.js";
const MAX_TRY_TIME = 10;

export class ListCollector extends ICollector {
    // #rules;
    #fetcher;
    #storageService
    #emitter;

    constructor(config, rules, fetcher, services) {
        super(config, rules, fetcher, services);
        this.#fetcher = fetcher;
        this.#storageService = services.storageService;
        this.#emitter = services.emitter;

    }

    async fetch(setting, payload) {
        const { url } = payload;
        const { rules } = setting;
        const host = rules[0].host;
        let curUrl = url;

        let tryTime = 0;
        while (curUrl && tryTime < MAX_TRY_TIME) {
            let newUrl = await this.#getData(curUrl, host, setting);
            if (!newUrl || newUrl == curUrl) await this.#storageService.deleteLastPage(host);
            curUrl = newUrl;
            tryTime++;
        }

        return this.#resultHandle(payload, true, "已完成列表采集");
    }

    async #getData(curURL, host, setting) {
        try {
            await this.#storageService.updateLastPage(curURL, host);
            const result = await this.#fetcher.fetch(curURL, setting, [RuleName.BookList]);
            const bnRsl = result.get(RuleName.BookList);
            if (!bnRsl || bnRsl.length <= 0 || bnRsl[0].text?.length == 0) return curURL;

            const pageURL = new URL(curURL);

            const bnURLs = bnRsl.map(({ text: book }) => book[1]);
            const existBook = await this.#storageService.findExistSource(bnURLs);
            if (bnRsl.length > existBook.length) {
                const bookNew = bnRsl.filter(b => !existBook.includes(b.text[1])).map(({ text: book }) => {
                    const data = {
                        BookName: book[0],
                        Source: book[1],
                        Host: host,
                        CoverImage: book[3],
                        Author: book[2]
                    };
                    if (data.CoverImage && !data.CoverImage?.startsWith("http")) data.CoverImage = `${pageURL.origin}${data.CoverImage}`;
                    if (data.Author.startsWith("作者")) data.Author = data.Author.replace(/作者[:：]?/g, "");
                    return data;
                });
                await this.#storageService.bulkCreate(bookNew);
            }

            const nxPage = result.get(RuleName.BookListNext)?.[0];
            if (result.has(RuleName.BookListNext) && !(nxPage instanceof Error)) {
                if (nxPage.text !== nxPage.Rule.checkSetting) return null;
                curURL = nxPage?.url;
            } else {
                curURL = null;
            }
        } catch (err) {
            const isBusy = /SQLITE_BUSY|database is locked/i.test(err?.message || '');
            if (isBusy) {
                logger.warn('[ListCollector] 数据库繁忙，终止本轮采集', err.message);
                throw err;   // 让上层 Executor 结束这个任务
            }
            if (err?.name?.startsWith("Sequelize") || err.sql || err?.parent?.sql) {
                logger.log(err.message, '\n', err?.parent?.message, '\n', err?.original);
                logger.warn(err.sql || err?.original?.sql);
            } else
                logger.warn("ListCollector:;fetch", err);
        }

        return curURL;
    }

    #resultHandle(payload, ok, message) {
        const { chapterId } = payload;
        const ctx = { chapterId };

        if (ok) {
            this.#emitter?.success(COLLECT_EVENTS.UPDATE_CHAPTER, { ctx, message });
        } else {
            this.#emitter?.failure(COLLECT_EVENTS.UPDATE_CHAPTER, {
                ctx,
                error: { message },
                message,
            });
        }

        // 保持对上游（Task 完成消息、Task.callback）的兼容返回
        return { payload, result: ok, message };
    }


}