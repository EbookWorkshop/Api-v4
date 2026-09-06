import { getHost } from "../../5-shared/utils/site.js";
import { RULE_GROUP, RULE_GROUP_SETTING, RuleCommon } from "../../3-domain/constants/Rule.js"
import { WEBSITE_TIMEOUT, WEBSITE_SCRAPING, WEBSITE_USERAGENT } from "../../3-domain/constants/SystemConfigGroup.js";
import { RuleForWebRepository } from '../../4-infrastructure/repositories/RuleForWebRepository.js';
import { AppError, UserInputError } from "../../5-shared/errors/index.js"

const DEFAULT_SCRAPING = "puppeteer";

export class RuleForWebQueryService {
    /** @type {RuleForWebRepository} */
    #ruleForWebRepository;
    /** @type {SystemConfigService} */
    #systemConfigService;
    /** @type {ReviewDictionaryService} */
    #reviewDictionaryService;
    #taskSchedulerService;

    /**
     * @param {RuleForWebRepository} ruleForWebRepository 
     * @param {SystemConfigService} systemConfigService 
     * @param {ReviewDictionaryService} reviewDictionaryService 
     */
    constructor(ruleForWebRepository, systemConfigService, reviewDictionaryService, taskSchedulerService) {
        this.#ruleForWebRepository = ruleForWebRepository;
        this.#systemConfigService = systemConfigService;
        this.#reviewDictionaryService = reviewDictionaryService;
        this.#taskSchedulerService = taskSchedulerService;
    }

    /**
     * 获取站点列表
     * @returns 
     */
    async listHosts() {
        return this.#ruleForWebRepository.listHosts();
    }

    /**
     * 通过网址/主机名获取对应的规则
     * @param {*} urlOrHost 
     * @returns 全套规则
     */
    async getRulesByHost(urlOrHost) {
        let host = getHost(urlOrHost);
        const rules = await this.#ruleForWebRepository.finByHost(host);
        let rsl = rules.map(r => ({
            host: r.Host,
            ruleName: r.RuleName,
            selector: r.Selector,
            getContentAction: r.GetContentAction,
            getUrlAction: r.GetUrlAction,
            checkSetting: r.CheckSetting,
            removeSelector: r.RemoveSelector ? r.RemoveSelector.split(",") : [],
            type: r.Type
        }));

        // //超时设置
        let timeout = await this.#systemConfigService.getConfig(WEBSITE_TIMEOUT, host);
        if (timeout) {
            rsl.push({
                ruleName: "Timeout",
                selector: timeout * 1,
            })
        }
        let userAgent = await this.#systemConfigService.getConfig(WEBSITE_USERAGENT, host);
        if (userAgent) {
            rsl.push({
                ruleName: "UserAgent",
                selector: userAgent,
            })
        }
        let scraping = await this.#systemConfigService.getConfig(WEBSITE_SCRAPING, host) || DEFAULT_SCRAPING;
        rsl.push({
            ruleName: "Scraping",
            selector: scraping,
        });

        let dict = await this.#reviewDictionaryService.getDictionaryByURL(host);
        if (dict)
            rsl.push({
                ruleName: "Dictionary",
                data: dict
            });
        return rsl;
    }

    /**
     * 按组获取规则
     * @param {string} urlOrHost 
     * @param {RULE_GROUP} group 规则组，按页类型划分的规则组
     * @returns 公共规则+按页划分的规则
     */
    async getRulesWithGroup(urlOrHost, group) {
        const rules = await this.getRulesByHost(urlOrHost);
        return this.divideRulesWithGroup(rules, group);
    }

    /**
     * 将全套规则按规则组划分
     * @param {*} rules 全套规则
     * @param {*} group  规则组，按页类型划分的规则组
     * @returns  公共规则+按页划分的规则
     */
    async divideRulesWithGroup(rules, group) {
        const ruleCommon = rules.filter(r => Object.keys(RuleCommon).includes(r.ruleName));
        const ruleNameArr = RULE_GROUP_SETTING[group];
        const result = rules.filter(r => ruleNameArr.includes(r.ruleName));
        return [...result, ...ruleCommon];
    }

    async getDictionaryByURL(host) {
        return this.#reviewDictionaryService.getDictionaryByURL(host);
    }

    async listRegisteredWebsites() {
        const hosts = await this.listHosts();

        const result = [];
        for (const item of hosts) {
            const rows = await this.#ruleForWebRepository.findHostUsing(item);
            let maxCreatedAt = null;
            if (rows && rows.length > 0) {
                maxCreatedAt = rows[0].MaxCreatedAt || null;
            }

            const bookMap = new Map();
            for (const r of rows) {
                const bookId = r['WebBook.BookId'] || r.BookId;
                const bookName = r['WebBook.Ebook.BookName'] || null;
                if (bookId && !bookMap.has(bookId)) bookMap.set(bookId, bookName);
            }

            result.push({
                Host: item,
                BookCount: bookMap.size,
                LastAddedTime: maxCreatedAt,
                Books: Array.from(bookMap.entries()).map(([BookId, BookName]) => ({ BookId, BookName })),
            });
        }
        return result;
    }

    /**
     * 可视化-预览规则
     * @param {string} testUrl 
     * @param {object} rule 
     */
    async visualizeRule(testUrl, rule) {
        return this.#taskSchedulerService.submitBotRuleVis(testUrl, rule)
    }
}
