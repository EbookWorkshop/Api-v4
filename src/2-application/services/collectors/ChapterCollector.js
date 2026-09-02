import { ICollector } from "../../ports/ICollector.js"
export class ChapterCollector extends ICollector {
    #rules;
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
}