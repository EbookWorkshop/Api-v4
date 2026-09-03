import { ICollector } from "../../ports/ICollector.js"

export class FileCollector extends ICollector {
    #rules;
    #fetcher;
    #eventManager;
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

    fetch(setting) {
        console.log(setting);
    }
}