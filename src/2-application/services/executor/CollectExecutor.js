import { ITaskExecutor } from '../../ports/ITaskExecutor.js';
import { TASK_TYPES } from '../../../3-domain/constants/Task.js';

import { WebBookCollector, ChapterCollector, FileCollector, ICollector } from "../collectors/index.js";
import { HttpDataFetcher, PuppeteerDataFetcher, RuleEngine, IDataFetcher } from "../../../4-infrastructure/fetchers/index.js"


export class CollectExecutor extends ITaskExecutor {
    #config;
    #ruleService;
    #repositories;
    constructor(config, ruleService, repositories) {
        super();
        this.#config = config;
        this.#ruleService = ruleService;
        this.#repositories = repositories;
    }

    async execute(taskType, payload) {
        try {
            let pageURL = await this.#getPageURL(taskType, payload);
            const rules = await this.#ruleService.getRulesByHost(pageURL);
            let Collector = ICollector;
            let fetcher = IDataFetcher;
            const ruleEngine = new RuleEngine({ debug: false });

            const scraper = rules.find(({ ruleName }) => ruleName === 'Scraping');
            switch (scraper.selector) {
                case "puppeteer": fetcher = new PuppeteerDataFetcher(this.#config, ruleEngine); break;
                case "http": fetcher = new HttpDataFetcher(this.#config, ruleEngine); break;
            }

            switch (taskType) {
                case TASK_TYPES.WEB_BOOK_COLLECT: Collector = WebBookCollector; break;
                case TASK_TYPES.SINGLE_CHAPTER_COLLECT: Collector = FileCollector; break;
                case TASK_TYPES.WEB_BOOK_CHAPTER_COLLECT: Collector = ChapterCollector; break;
                default:
                    throw new Error('未知任务类型！');
            }
            const collector = new Collector(rules, fetcher);
            return await collector.fetch(payload);
        } catch (error) {
            error.stack = `CollectExecutor::execute: ${import.meta.filename}\n${error.stack}`;
            throw error;
        }
    }

    async #getPageURL(taskType, payload) {
        switch (taskType) {
            case TASK_TYPES.WEB_BOOK_COLLECT: return payload.sourcePage;
            case TASK_TYPES.SINGLE_CHAPTER_COLLECT: return payload.url;
            case TASK_TYPES.WEB_BOOK_CHAPTER_COLLECT: {
                // const { chapterId } = payload;
                // const [rows] = await this.#repositories.webBookChapterURLRepository.queryURLByChapterId(chapterId);
                // return rows.Path;   //TODO: 根据源获取默认地址
                return "TODO: ??"
            }
            default:
                throw new Error('未知任务类型！');
        }
    }
}