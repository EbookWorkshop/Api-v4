import { ICollector } from "../../ports/ICollector.js";
import { RULE_INDEX, RULE_INFO, RuleName } from "../../../3-domain/constants/Rule.js"
import { COLLECT_EVENTS } from "../../../3-domain/constants/Event.js";



export class WebBookCollector extends ICollector {
    #rules;
    /** @type {IDataFetcher} */
    #fetcher;
    #setting;
    #eventManager
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

    }

    /**
     * 
     * @param {{ timeout, userAgent, dictionaries, rules }} setting 
     * @param {Object} payload 
     * @param {string} payload.sourcePage 索引页
     * @param {boolean} payload.isEmbedBookName 是否嵌入标题
     * @param {string} [payload.infoPage] 信息页
     */
    async fetch(setting, payload) {
        this.#setting = setting;
        const { sourcePage, infoPage, isEmbedBookName } = payload;
        let urlPage = sourcePage;
        if (infoPage) urlPage = infoPage;
        const result = await this.#fetcher.fetch(urlPage, setting);
        const info = new Map();
        RULE_INFO.map(r => info.set(r, result.get(r)));
        const infoResult = this.#handleInfo(info);
        if (!infoResult) return this.#resultHandle(payload, false, "书籍信息处理失败");

        let cpl = new Map();
        RULE_INDEX.map(r => cpl.set(r, result.get(r)));
        if (infoPage) cpl = await this.#fetcher.fetch(sourcePage, setting);

        const chapList = cpl.get(RuleName.ChapterList);
        if (!chapList || chapList.length <= 0) return this.#resultHandle(payload, false, "书籍采集失败，没有章节信息。");

        const chapterList = await this.#handleChapterList(cpl);

        const bookResult = {
            ...infoPage,
            ChapterList: chapterList
        };

        this.#checkData(bookResult);

        await this.#save(bookResult);
    }

    /**
     * 处理书籍的主要信息
     * @param {*} infoResult 
     * @returns 
     */
    #handleInfo(infoResult) {
        const bn = infoResult.get(RuleName.BookName);
        if (!bn || !bn[0].text) return false;
        const bookInfo = {};
        for (const k of infoResult.keys()) {
            const rsl = infoResult.get(k);
            if (!rsl || !rsl[0].text) continue;
            bookInfo[k] = rsl[0].text;
        }
        return bookInfo;
    }

    async #handleChapterList(cpl) {
        const chapterList = [];
        let nextPage = false;
        let result = cpl;
        let runTime = 0;
        do {
            console.log(nextPage);
            const cl = result.get(RuleName.ChapterList);
            chapterList.push(...cl);

            const np = result.get(RuleName.IndexNextPage);
            if (np && np[0]) {
                if (Error.isError(np[0])) {
                    runTime++;
                    console.log(`更新章节目录失败，重试：`, nextPage);
                    continue;
                }

                nextPage = false;
                for (let i = 0; i < np.length; i++) {   //同时命中多个下一页按钮，找到下一个
                    const { text, Rule: rule, url } = np[i];
                    if (text === rule.checkSetting) nextPage = url;
                }
                if (!nextPage) break;
                result = await this.#fetcher.fetch(nextPage, this.#setting);
            } else nextPage = false;
        } while (nextPage && runTime <= 15);

        return chapterList;
    }

    #checkData(bookData) {

    }

    async #save(bookData) {
        console.log(bookData);
    }

    #resultHandle(payload, result, message) {
        // const { bookId, chapterId, url } = payload;
        this.#eventManager.emitToMain(COLLECT_EVENTS.CREATE_BOOK, { result, message });
        return result;
    }
}