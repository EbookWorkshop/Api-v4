import { ICollector } from "../../ports/ICollector.js"


export class WebBookCollector extends ICollector {
    #rules;
    /** @type {IDataFetcher} */
    #fetcher;
    /**
     * 
     * @param {Array<Object>} rules 
     * @param {IDataFetcher} fetcher 
     */
    constructor(rules, fetcher) {
        super();
        this.#rules = rules;
        this.#fetcher = fetcher;
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
        // console.log(setting, payload);
        const result = await this.#fetcher.fetch(payload.sourcePage, setting);

        console.log(result);
    }
}