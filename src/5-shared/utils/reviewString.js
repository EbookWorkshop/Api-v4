/**
 * 校阅字符串工具 - 从旧项目迁移
 */
export class ReviewString {
    /**
     * 应用单个规则到文本
     * @param {Object} rule - { Rule: string|RegExp, Replace: string }
     * @param {string} text
     * @returns {string}
     */
    static applyRule(rule, text) {
        if (!rule?.Rule || !text) return text;
        let rTarget = rule.Replace || '';
        // 处理转义字符
        if (rTarget.includes('\\')) {
            rTarget = rTarget.replace(/\\n/g, '\n');
        }
        try {
            const regex = (rule.Rule instanceof RegExp) ? rule.Rule : new RegExp(rule.Rule, 'gm');
            return text.replace(regex, rTarget);
        } catch {
            return text;
        }
    }

    /**
     * 测试规则（返回匹配详情）
     */
    static testRule(rule, testText) {
        if (!rule?.Rule || !testText) return { match: false, source: testText, result: null };
        const regex = new RegExp(rule.Rule, 'gm');
        const match = testText.match(regex);
        const result = testText.replace(regex, rule.Replace || '');
        return { match, source: testText, result };
    }
}