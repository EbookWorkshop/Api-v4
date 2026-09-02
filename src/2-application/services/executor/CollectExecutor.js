import { EventEmitter } from "node:events"
import { ITaskExecutor } from '../../ports/ITaskExecutor.js';
import { TASK_TYPES } from '../../../3-domain/constants/Task.js';
import { RULE_GROUP, RULE_ALL, RuleCommon } from "../../../3-domain/constants/Rule.js";
import { AppError } from '../../../5-shared/errors/index.js';
import { WebBookCollector, ChapterCollector, FileCollector, ICollector } from "../collectors/index.js";
import { HttpDataFetcher, PuppeteerDataFetcher, RuleEngine, IDataFetcher } from "../../../4-infrastructure/fetchers/index.js";
import { EventManager, COLLECT_EVENTS } from "../../../4-infrastructure/event/EventManager.js"
import { RuleForWebQueryService } from '../RuleForWebQueryService.js';

import { ChapterQueryService } from "../ChapterQueryService.js";
import { ChapterCommandService } from "../ChapterCommandService.js";

export class CollectExecutor extends ITaskExecutor {
    #config;
    /** @type {RuleForWebQueryService} */
    #ruleService;
    #repositories;
    #transactionManager;
    #chapService;
    #eventManager;
    constructor(config, ruleService, resources, chapService) {
        super();
        this.#config = config;
        this.#ruleService = ruleService;
        this.#repositories = resources.repositories;
        this.#transactionManager = resources.transactionManager;
        this.#chapService = chapService;
        this.#eventManager = new EventManager(new EventEmitter());
    }

    async execute(taskType, payload) {
        let msgEvent = null;
        try {
            let pageURL = await this.#getPageURL(taskType, payload);
            let Collector = ICollector;
            let fetcher = IDataFetcher;
            let ruleGroup = COLLECT_EVENTS.UNKNOW;
            let services = { eventManager: this.#eventManager };

            switch (taskType) {
                case TASK_TYPES.WEB_BOOK_COLLECT: {
                    Collector = WebBookCollector;
                    ruleGroup = RULE_GROUP.INFO_INDEX_PAGE;
                    break;
                }
                case TASK_TYPES.SINGLE_CHAPTER_COLLECT: {
                    Collector = FileCollector;
                    ruleGroup = RULE_GROUP.CHAPTER_PAGE;
                    break;
                }
                case TASK_TYPES.WEB_BOOK_CHAPTER_COLLECT: {
                    Collector = ChapterCollector;
                    ruleGroup = RULE_GROUP.CHAPTER_PAGE;
                    payload.url = pageURL;
                    services = {
                        ...services,
                        ... this.#createChapterServices(),
                    };
                    msgEvent = COLLECT_EVENTS.UPDATE_CHAPTER;
                    break;
                }
                default:
                    throw new AppError('未知任务类型！');
            }

            const rules = await this.#ruleService.getRulesWithGroup(pageURL, ruleGroup);
            const ruleEngine = new RuleEngine({ debug: false });
            const scraper = rules.find(({ ruleName }) => ruleName === RuleCommon.Scraping);
            switch (scraper.selector) {
                case "puppeteer": fetcher = new PuppeteerDataFetcher(this.#config, ruleEngine); break;
                case "http": fetcher = new HttpDataFetcher(this.#config, ruleEngine); break;
            }

            const setting = this.#rangeSetting(rules, payload);
            const collector = new Collector(rules, fetcher, services);
            return await collector.fetch(setting, payload);
        } catch (error) {
            error.stack = `CollectExecutor::execute: ${import.meta.filename}\n${error.stack}`;
            this.#eventManager.emitToMain(msgEvent, {
                result: false, message: "采集任务执行失败", error: {
                    name: error.name || `失败任务：${taskType}`,
                    message: error.message || '',
                    stack: error.stack || '',
                }
            });
            throw error;
        }
    }

    async #getPageURL(taskType, payload) {
        switch (taskType) {
            case TASK_TYPES.WEB_BOOK_COLLECT: return payload.sourcePage;
            case TASK_TYPES.SINGLE_CHAPTER_COLLECT: return payload.url;
            case TASK_TYPES.WEB_BOOK_CHAPTER_COLLECT: {
                const { chapterId, bookId } = payload;
                const urlInfo = await this.#chapService.getDefaultChapterSource(chapterId, bookId);
                return urlInfo.Path;
            }
            default:
                throw new AppError('未知任务类型！');
        }
    }

    /**
     * 
     * @param {*} rules 
     * @returns {{ timeout, userAgent, dictionaries, rules }}
     */
    #rangeSetting(rules) {
        const setting = {
            rules: rules.filter(({ ruleName }) => RULE_ALL.includes(ruleName)),
        }

        const timeout = rules.find(({ ruleName }) => RuleCommon.Timeout === ruleName);
        if (timeout?.selector) setting.timeout = timeout?.selector;
        const userAgent = rules.find(({ ruleName }) => RuleCommon.UserAgent === ruleName);
        if (userAgent?.selector) setting.userAgent = userAgent?.selector;
        const dictionaries = rules.find(({ ruleName }) => RuleCommon.Dictionary === ruleName);
        if (dictionaries?.data) setting.dictionaries = dictionaries?.data;

        return setting;
    }

    #createChapterServices() {
        return {
            chapQueryServices: new ChapterQueryService(this.#repositories.chapterRepository),
            chapCommaServices: new ChapterCommandService(this.#repositories.chapterRepository, this.#transactionManager)
        }
    }
}