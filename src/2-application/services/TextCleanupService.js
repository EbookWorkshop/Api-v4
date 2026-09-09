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
        if (rules.length === 0) return [];//空结果不缓存
        const rR = rules.map(({ Rule, Replace }) => { return { Replace, Rule: new RegExp(Rule, 'gm'), } });
        this.#cache.set(ruleKey, rR, 3 * 60_000);   //缓存3分钟，导出功能时会多章节频繁调用；但如果设置时间过长，会导致新增的规则要到超时之后才能生效。
        return rR;
    }
}