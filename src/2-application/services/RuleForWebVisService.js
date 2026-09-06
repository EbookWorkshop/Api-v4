

/**
 * 规则可视化
 */
export class RuleForWebVisService {
    #fetcher;
    constructor(fetcher) {
        this.#fetcher = fetcher;
    }


    async ruleVis(url, rule) {
        const setting = {
            rules: [rule],
            isVis: true,
        }
        return await this.#fetcher.fetch(url, setting);
    }

}