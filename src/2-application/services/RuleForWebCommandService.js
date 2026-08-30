import { RuleForWebRepository } from '../../4-infrastructure/repositories/RuleForWebRepository.js';
import { IFileScanner } from "../../2-application/ports/IFileScanner.js"
import { ITransaction } from '../ports/ITransaction.js';
import { AppError } from "../../5-shared/errors/index.js"
import { WEBSITE_TIMEOUT, WEBSITE_USERAGENT, WEBSITE_SCRAPING } from '../../3-domain/constants/SystemConfigGroup.js';

const DEFAULT_TIME_OUT = 40_000;
const DEFAULT_SCRAPING = "puppeteer";

export class RuleForWebCommandService {
    /** @type {RuleForWebRepository} */
    #ruleForWebRepository;
    #sysConfig;
    /** @type {ITransaction} */
    #transaction;
    /** @type {IFileScanner} */
    #fileScanner;

    /**
     * @param {RuleForWebRepository} ruleForWebRepository 
     * @param {IFileScanner} fileScanner 
     */
    constructor(ruleForWebRepository, systemConfigService, transaction, fileScanner) {
        this.#ruleForWebRepository = ruleForWebRepository;
        this.#sysConfig = systemConfigService;
        this.#transaction = transaction;
        this.#fileScanner = fileScanner;
    }

    async importRulesFromFile(file) {
        const rules = await this.#fileScanner.readFileData(file, { format: "json" });
        return this.batchUpsertRules(rules);
    }

    async batchUpsertRules(rules) {
        return this.#transaction.runInTransaction(async (trans) => {
            //全套规则删除并更新
            const oneHost = rules[0].host;
            await this.deleteRules(oneHost, { transaction: trans });

            const timeoutRule = rules.find(r => r.ruleName == "Timeout");
            if (timeoutRule && timeoutRule.selector != DEFAULT_TIME_OUT) {
                await this.#sysConfig.setConfig(WEBSITE_TIMEOUT, oneHost, timeoutRule.selector, { transaction: trans });
            }
            rules = rules.filter(r => r.ruleName != "Timeout");
            const userAgentRule = rules.find(r => r.ruleName == "UserAgent");
            if (userAgentRule) {
                await this.#sysConfig.setConfig(WEBSITE_USERAGENT, oneHost, userAgentRule.selector, { transaction: trans });
                rules = rules.filter(r => r.ruleName != "UserAgent");
            }
            const scraping = rules.find(r => r.ruleName == "Scraping");
            if (scraping && scraping.selector != DEFAULT_SCRAPING) {
                await this.#sysConfig.setConfig(WEBSITE_SCRAPING, oneHost, scraping.selector, { transaction: trans });
            }
            rules = rules.filter(r => r.ruleName != "Scraping");

            //TODO: 设置站点校阅字典
            // const dict = rules.find(d => d.ruleName == "Dictionary");
            // if (dict && dict.data) {
            //     await DO.DeleteReviewDictionary(oneHost, trans);
            //     await DO.SaveDictionaries(oneHost, dict.data, trans);
            rules = rules.filter(r => r.ruleName != "Dictionary");
            // }
            for (let p of rules) {
                let rule = {
                    Host: p.host,
                    RuleName: p.ruleName,
                    Selector: p.selector
                }
                if (Array.isArray(p.removeSelector) && p.removeSelector.length > 0) {
                    rule.RemoveSelector = p.removeSelector.join(",");
                }
                if (p.getContentAction) rule.GetContentAction = p.getContentAction;
                if (p.getUrlAction) rule.GetUrlAction = p.getUrlAction;
                if (p.type == "Object" || p.type == "List") rule.Type = p.type;
                if (p.checkSetting) rule.CheckSetting = p.checkSetting;

                let ret = await this.#ruleForWebRepository.create(rule, { transaction: trans });
            }

            return true;
        });
    }

    /**
     * 删除全套规则
     * @param {string} host 
     * @param {*} transaction 
     */
    async deleteRules(host, { transaction }) {
        let deleter = async (tran) => {
            //删除附加配置
            await this.#sysConfig.deleteConfig(undefined, host, { transaction: tran });
            //删除Bot规则
            await this.#ruleForWebRepository.delete(host, { transaction: tran })
            //TODO: 删除校阅字典
            return true;
        }
        if (!transaction) return this.#transaction.runInTransaction(deleter.bind(this));
        return deleter.bind(this)(transaction);
    }

}