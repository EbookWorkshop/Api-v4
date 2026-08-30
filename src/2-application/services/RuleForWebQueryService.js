import { getHost } from "../../5-shared/utils/site.js";
import { WEBSITE_TIMEOUT, WEBSITE_SCRAPING, WEBSITE_USERAGENT } from "../../3-domain/constants/SystemConfigGroup.js";
import { RuleForWebRepository } from '../../4-infrastructure/repositories/RuleForWebRepository.js';
import { ReviewDictionaryRepository } from "../../4-infrastructure/repositories/ReviewDictionaryRepository.js";
import { AppError, UserInputError } from "../../5-shared/errors/index.js"

const DEFAULT_SCRAPING = "puppeteer";

export class RuleForWebQueryService {
    /** @type {RuleForWebRepository} */
    #ruleForWebRepository;
    /** @type {SystemConfigService} */
    #systemConfigService;
    /** @type {ReviewDictionaryRepository} */
    #dictionaryRepository;

    /**
     * @param {RuleForWebRepository} ruleForWebRepository 
     * @param {SystemConfigService} systemConfigService 
     * @param {ReviewDictionaryRepository} dictionaryRepository 
     */
    constructor(ruleForWebRepository, systemConfigService, dictionaryRepository) {
        this.#ruleForWebRepository = ruleForWebRepository;
        this.#systemConfigService = systemConfigService;
        this.#dictionaryRepository = dictionaryRepository;
    }

    /**
     * 获取站点列表
     * @returns 
     */
    async listHosts() {
        return this.#ruleForWebRepository.listHosts();
    }


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

        let dict = await this.#dictionaryRepository.GetDictionaryByURL(host);
        if (dict)
            rsl.push({
                ruleName: "Dictionary",
                data: dict
            });
        return rsl;
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
}
