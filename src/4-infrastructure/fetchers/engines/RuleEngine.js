// import { EventManager } from '../../event/EventManager.js';

import { RuleName } from "../../../3-domain/constants/Rule.js"
import { AppError } from "../../../5-shared/errors/index.js";

/**
 * 规则执行引擎（基础设施层）
 * 负责：在页面上执行 CSS 选择器、移除干扰节点、提取内容、应用字典替换。
 * 依赖：puppeteer Page 或 cheerio 文档（可设计为适配器模式）
 */
export class RuleEngine {
    constructor() {
        this.debug = false;
    }

    /**
     * 执行单个规则采集
     * @param {puppeteer.Page} pageObj
     * @param {Object} rule - 规则配置
     * @param {boolean} isVis - 是否可视化（调试模式）
     * @returns {Array<{Rule,text, url}|Object>}
     */
    async execRule(pageObj, rule, isVis = false) {
        //先尝试删除干扰元素
        if (typeof (rule.removeSelector) === "string") rule.removeSelector = [rule.removeSelector];
        for (let sR of rule.removeSelector)
            try {
                await pageObj.$$eval(sR, (node, isVis) => {
                    for (let nO of node)
                        if (!isVis) nO.parentNode.removeChild(nO);
                        else nO.style.border = "5px solid blue";
                }, isVis);
            } catch (err) { }//尝试删除干扰元素，失败不管

        if (rule.selector === "") return [new AppError("当前规则还没设置选择器。")];
        let querySelector = (rule.type === "List") ? pageObj.$$eval : pageObj.$eval;

        try {
            //注意：下述代码块运行在浏览器端
            let rsl = await querySelector.call(pageObj, rule.selector, (node, option, isVis) => {
                if (!node || node?.length == 0) { return []; }      //没命中元素
                /**
                 * 动作表达式解释处理器 
                 * 只能定义在浏览器端，对象不能序列化
                 * 在服务器执行会失效
                 * @param {*} action 动作表达式，如：attr/innerText
                 * @param {*} myNode 已命中的node对象
                 * @returns {text,url}
                 */
                let ActionHandle = (action, myNode) => {
                    if (action == undefined) return;
                    let result;
                    let acExp = action.split("/");
                    //配置的动作表达式
                    switch (acExp[0]) {
                        case "attr": result = myNode[acExp[1]]; break;
                        case "fun": result = myNode[acExp[1]](...acExp.slice(2)); break;  //执行节点上的方法
                        case "cache": result = "cache::" + myNode[acExp[1]]; break;       //缓存的
                        case "reg": result = "ToDo:RegExp"; break;
                    }
                    return result?.trim();
                }

                let myRsl = [];
                if (option.type !== "List") node = [node];
                for (let n of node) {
                    myRsl.push({
                        Rule: option,
                        text: ActionHandle(option.getContentAction, n),
                        url: ActionHandle(option.getUrlAction, n),
                    });

                    if (isVis) {
                        n.style.border = "5px solid red";
                        n.title = `${curObj.url}\n${curObj.text}`
                    }
                }
                return myRsl;
            }, rule, isVis);
            return rsl;
        } catch (err) { //没抓到数据 一般是选择器没命中
            return [err, rule.selector, err.message, await pageObj.content()];//实际返回错误的时候
        }
    }

    /**
     * 执行所有规则
     * @param {puppeteer.Page} pageObj
     * @param {Array<Object>} rules - 规则列表
     * @param {Array<Object>} dictionaries - 字典列表（用于 Content 规则）
     * @returns {Map<string, Array>} - key: ruleName, value: 提取结果
     */
    async extract(pageObj, rules, dictionaries = []) {
        const resultMap = new Map();

        for (const rule of rules) {
            let ruleResult = await this.execRule(pageObj, rule, this.debug);

            // 如果是 Content 规则，应用字典
            if (rule.ruleName === RuleName.Content && dictionaries.length > 0) {
                if (Error.isError(ruleResult[0])) continue;
                const activeDicts = await this.filterActiveDictionaries(pageObj, dictionaries);
                const combinedData = activeDicts.map(d => d.Data).join('\n');
                ruleResult = ruleResult.map(item => ({
                    ...item,
                    text: this.applyDictionary(combinedData, item.text)
                }));
            }
            resultMap.set(rule.ruleName, ruleResult);
        }
        return resultMap;
    }

    /**
     * 过滤出所有需要执行的字典
     */
    async filterActiveDictionaries(pageObj, dictionaries) {
        const results = [];
        for (const dict of dictionaries) {
            let active = false;
            if (dict.ExecuteType === 'Selector') {
                active = await this.checkSelectorExists(pageObj, dict.Execute);
            } else if (dict.ExecuteType === 'Boolean') {
                active = dict.Execute === 'true' || dict.Execute === '1';
            }
            if (active) results.push(dict);
        }
        return results;
    }

    /**
     * 应用字典替换
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

    // 私有辅助：检查选择器的条件是否存在
    async checkSelectorExists(pageObj, selector) {
        return await pageObj.$$eval.call(pageObj, selector, (node) => { return node.length > 0; });
    }
}