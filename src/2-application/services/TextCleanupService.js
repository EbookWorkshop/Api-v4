import { ReviewString } from "../../5-shared/utils/reviewString.js"


export class TextCleanupService {
    #reviewRuleRepository;
    #cache;
    constructor(reviewRuleRepository, cache) {
        this.#reviewRuleRepository = reviewRuleRepository;
        this.#cache = cache;
    }

    async cleanup(bookId, text) {
        const rules = await this.#getRulesByBookId(bookId);
        for (const r of rules)
            text = ReviewString.applyRule(r, text);
        return text;
    }

    /**
     * 【带缓存】获取指定书籍的校阅规则
     * @param {number} bookId 
     * @returns {Array<{ Rule:RegExp, Replace:string }>}
     */
    async #getRulesByBookId(bookId) {
        const ruleKey = `review-rule:${bookId}`;
        const value = this.#cache.get(ruleKey);
        if (value) return value;
        const rules = await this.#reviewRuleRepository.findRulesByBookId(bookId);
        const rR = rules.map(({ Rule, Replace }) => { return { Replace, Rule: new RegExp(Rule, 'gm'), } });
        this.#cache.set(ruleKey, rR);
        return rR;
    }
}