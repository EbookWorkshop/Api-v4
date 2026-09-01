// import { EventManager } from '../../event/EventManager.js';

/**
 * 规则执行引擎（基础设施层）
 * 负责：在页面上执行 CSS 选择器、移除干扰节点、提取内容、应用字典替换。
 * 依赖：puppeteer Page 或 cheerio 文档（可设计为适配器模式）
 */
export class RuleEngine {
    constructor(options = { debug: false }) {
        this.debug = options.debug;
    }

    /**
     * 执行单个规则
     * @param {puppeteer.Page|cheerio.Root} pageOrDoc
     * @param {Object} rule - 规则配置
     * @param {boolean} isVis - 是否可视化（调试模式）
     * @returns {Array<{text, url}>}
     */
    async execRule(pageOrDoc, rule, isVis = false) {
        // 1. 移除干扰元素 (RemoveSelector)
        // 2. 根据 Type (Object/List) 选择查询方式
        // 3. 执行 GetContentAction / GetUrlAction
        // 4. 返回 [{ text, url }]
        // 注意：如果 pageOrDoc 是 puppeteer Page，使用 page.evaluate；
        //       如果是 cheerio，使用 cheerio API。
    }

    /**
     * 执行规则集（原 GetDataUseRuleFromPage）
     * @param {puppeteer.Page|cheerio.Root} pageOrDoc
     * @param {Array<Object>} rules - 规则列表
     * @param {Array<Object>} dictionaries - 字典列表（用于 Content 规则）
     * @returns {Map<string, Array>} - key: ruleName, value: 提取结果
     */
    async extract(pageOrDoc, rules, dictionaries = []) {
        const resultMap = new Map();

        for (const rule of rules) {
            let ruleResult = await this.execRule(pageOrDoc, rule, this.debug);

            // 如果是 Content 规则，应用字典
            if (rule.RuleName === 'Content' && dictionaries.length > 0) {
                // 先判断字典是否生效（isExec 逻辑）
                const activeDicts = await this.filterActiveDictionaries(pageOrDoc, dictionaries);
                const combinedData = activeDicts.map(d => d.Data).join('\n');
                ruleResult = ruleResult.map(item => ({
                    ...item,
                    text: this.applyDictionary(combinedData, item.text)
                }));
            }

            resultMap.set(rule.RuleName, ruleResult);
        }

        return resultMap;
    }

    /**
     * 判断字典是否生效（原 isExec）
     * 支持 Selector 和 Boolean 两种模式
     */
    async filterActiveDictionaries(pageOrDoc, dictionaries) {
        const results = [];
        for (const dict of dictionaries) {
            let active = false;
            if (dict.ExecuteType === 'Selector') {
                // 使用 page.$$eval 或 cheerio 判断是否存在
                active = await this.checkSelectorExists(pageOrDoc, dict.Execute);
            } else if (dict.ExecuteType === 'Boolean') {
                active = dict.Execute === 'true' || dict.Execute === '1';
            }
            if (active) results.push(dict);
        }
        return results;
    }

    /**
     * 应用字典替换（原 UseDictReplace）
     */
    applyDictionary(dictData, text) {
        if (!text) return text;
        const map = new Map();
        const rows = dictData.split('\n');
        for (const row of rows) {
            const [key, value] = row.trim().split(/\s+/);
            if (key && value) {
                // 支持 \u 转义
                const realKey = key.startsWith('\\u') ? String.fromCharCode(parseInt(key.slice(2), 16)) : key;
                map.set(realKey, value);
            }
        }
        let result = text;
        for (const [k, v] of map) {
            result = result.replaceAll(k, v);
        }
        return result;
    }

    // 私有辅助：检查选择器是否存在
    async checkSelectorExists(pageOrDoc, selector) {
        // 实现取决于 pageOrDoc 类型
    }
}