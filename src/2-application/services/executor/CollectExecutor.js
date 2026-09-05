import { EventEmitter } from "node:events"
import { ITaskExecutor } from '../../ports/ITaskExecutor.js';
import { TASK_TYPES } from '../../../3-domain/constants/Task.js';
import { RULE_GROUP, RULE_ALL, RuleCommon } from "../../../3-domain/constants/Rule.js";
import { AppError } from '../../../5-shared/errors/index.js';
import { WebBookCollector, ChapterCollector, FileCollector, ICollector } from "../collectors/index.js";
import { AxiosDataFetcher, PuppeteerDataFetcher, RuleEngine, IDataFetcher } from "../../../4-infrastructure/fetchers/index.js";
import { EventManager, COLLECT_EVENTS } from "../../../4-infrastructure/event/EventManager.js"
import { RuleForWebQueryService } from '../RuleForWebQueryService.js';

import { ChapterQueryService } from "../ChapterQueryService.js";
import { ChapterCommandService } from "../ChapterCommandService.js";

import { WebBookQueryService } from "../WebBookQueryService.js";
import { WebBookCommandService } from "../WebBookCommandService.js";
import { WebBookChapterService } from "../WebBookChapterService.js"

import { CoverService } from "../CoverService.js"

import { FileSystemWriter } from "../../../4-infrastructure/server/adapters/FileSystemWriter.js"

export class CollectExecutor extends ITaskExecutor {
    #config;
    /** @type {RuleForWebQueryService} */
    #ruleService;
    #repositories;
    #transactionManager;
    #chapService;
    #eventManager;
    #fileWriter;
    constructor(config, ruleService, resources, chapService) {
        super();
        this.#config = config;
        this.#ruleService = ruleService;
        this.#repositories = resources.repositories;
        this.#transactionManager = resources.transactionManager;
        this.#chapService = chapService;

        this.#eventManager = new EventManager(new EventEmitter());
        this.#fileWriter = new FileSystemWriter(this.#config.repository.path);
    }

    async execute(taskType, payload) {
        const ruleEngine = new RuleEngine({ debug: false });
        let msgEvent = null;
        let fetcher = IDataFetcher;
        try {
            let pageURL = await this.#getPageURL(taskType, payload);
            let Collector = ICollector;
            let ruleGroup = COLLECT_EVENTS.UNKNOW;
            let services = { eventManager: this.#eventManager };
            switch (taskType) {
                case TASK_TYPES.WEB_BOOK_COLLECT: {
                    Collector = WebBookCollector;
                    ruleGroup = RULE_GROUP.INFO_INDEX_PAGE;
                    msgEvent = COLLECT_EVENTS.CREATE_BOOK;
                    payload.mode = "create";

                    services = {
                        ...services,
                        ...this.#createWebBookServices(),
                    }
                    break;
                }
                case TASK_TYPES.WEB_BOOK_UPDATE_INDEX: {
                    Collector = WebBookCollector;
                    ruleGroup = RULE_GROUP.INDEX_PAGE;
                    msgEvent = COLLECT_EVENTS.UPDATE_INDEX;
                    payload.mode = "update";
                    payload.sourcePage = pageURL;
                    services = {
                        ...services,
                        ...this.#createWebBookServices(),
                    }
                    break;
                }
                case TASK_TYPES.SINGLE_CHAPTER_COLLECT: {
                    Collector = FileCollector;
                    ruleGroup = RULE_GROUP.CHAPTER_PAGE;
                    services.fileWriter = this.#fileWriter;
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
            const scraper = rules.find(({ ruleName }) => ruleName === RuleCommon.Scraping);
            switch (scraper.selector) {
                case "http": fetcher = new AxiosDataFetcher(this.#config, ruleEngine, true); break;
                case "puppeteer":
                default: fetcher = new PuppeteerDataFetcher(this.#config, ruleEngine, true); break;
            }
            const collector = new Collector(this.#config, rules, fetcher, services);

            const setting = this.#rangeSetting(rules, payload);
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
        } finally {
            await fetcher?.close?.();
        }
    }

    async #getPageURL(taskType, payload) {
        switch (taskType) {
            case TASK_TYPES.WEB_BOOK_COLLECT: return payload.sourcePage;
            case TASK_TYPES.SINGLE_CHAPTER_COLLECT: return payload.url;
            case TASK_TYPES.WEB_BOOK_UPDATE_INDEX: {
                const bookQuery = new WebBookQueryService(this.#repositories.webBookRepository, this.#repositories.webBookSourceURLRepository);
                const urlInfo = await bookQuery.getDefSources(payload.bookId);
                return urlInfo.Path;
            }
            case TASK_TYPES.WEB_BOOK_CHAPTER_COLLECT: {
                const { chapterId, bookId } = payload;
                const urlInfo = await this.#chapService.getDefaultChapterSource(chapterId, bookId);
                return urlInfo.Path;
            }
            default:
                throw new AppError('未知任务类型，未能获取采集主机！');
        }
    }

    /**
     * 包装抓取规则、设置
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

    #createWebBookServices() {
        const { webBookRepository, ebookRepository, chapterRepository, webBookChapterRepository, webBookSourceURLRepository, webBookChapterURLRepository } = this.#repositories;
        const webBookChapterService = new WebBookChapterService(this.#transactionManager, chapterRepository, webBookChapterRepository, webBookChapterURLRepository);
        return {
            webBookService: new WebBookCommandService(webBookRepository, this.#transactionManager, ebookRepository, chapterRepository, webBookSourceURLRepository, webBookChapterService),
            coverService: new CoverService(this.#fileWriter, null, this.#config),
            webBookChapterService,
        }
    }
}