import { EventEmitter } from "node:events"
import { ITaskExecutor } from '../../ports/ITaskExecutor.js';
import { RULE_ALL, RuleCommon } from "../../../3-domain/constants/Rule.js";
import { AppError } from '../../../5-shared/errors/index.js';
// import { logger } from "../../../5-shared/logging/index.js";
import { AxiosDataFetcher, PuppeteerDataFetcher, RuleEngine } from "../../../4-infrastructure/fetchers/index.js";
import { EventManager } from "../../../4-infrastructure/event/EventManager.js"
import { RuleForWebQueryService } from '../RuleForWebQueryService.js';

// import { ChapterQueryService } from "../ChapterQueryService.js";
import { ChapterCommandService } from "../ChapterCommandService.js";
import { BookQueryService } from "../BookQueryService.js";
import { WebBookQueryService } from "../WebBookQueryService.js";
import { WebBookCommandService } from "../WebBookCommandService.js";
import { WebBookChapterService } from "../WebBookChapterService.js";
import { WebBookChapterURLService } from "../WebBookChapterURLService.js";

import { CoverService } from "../CoverService.js"

import { FileSystemWriter } from "../../../4-infrastructure/server/adapters/FileSystemWriter.js"
import { CollectEventEmitter } from "../../events/index.js";
import { StorageService } from "../StorageService.js";

import { COLLECT_DESCRIPTORS } from '../collectors/descriptors.js';
export class CollectExecutor extends ITaskExecutor {
    #config;
    /** @type {RuleForWebQueryService} */
    #ruleService;
    #repositories;
    #transactionManager;
    #chapService;
    #eventManager;
    #fileWriter;
    #_fetcher;
    /** @type {WebBookQueryService} */
    #bookQuery;
    /** @type {StorageService} */
    #storageService;
    /** @type {import('../collectors/descriptors.js').CollectQueryCtx} 当前业务上下文*/
    #queryCtx;

    constructor(config, ruleService, resources, chapService) {
        super();
        this.#config = config;
        this.#ruleService = ruleService;
        this.#repositories = resources.repositories;
        this.#transactionManager = resources.transactionManager;
        this.#chapService = chapService;

        this.#eventManager = new EventManager(new EventEmitter());
        this.#fileWriter = new FileSystemWriter(this.#config.repository.path);

        this.#bookQuery = new WebBookQueryService(
            this.#repositories.webBookRepository,
            this.#repositories.webBookSourceURLRepository,
        );
        this.#storageService = new StorageService(this.#repositories.storageRepository);

        this.#queryCtx = Object.freeze({
            getBookDefaultSource: (bookId) => this.#bookQuery.getDefSources(bookId),
            getChapterDefaultSource: (chapterId, bookId) => this.#chapService.getDefaultChapterSource(chapterId, bookId),
            findBookName: async (bookId) => (await this.#repositories.ebookRepository.findById(bookId))?.BookName,
            getLastListPage: () => this.#storageService.getLastPage(),
            findOneMissingCover: () => this.#storageService.findOneMissingCover(),
            findOneNeedingCoverCache: (threshold) => this.#storageService.findOneNeedingCoverCache(threshold),
        });
    }

    async execute(taskType, payload = {}) {
        const desc = COLLECT_DESCRIPTORS[taskType];
        if (!desc) throw new AppError(`未知采集任务类型：${taskType}`);

        const emitter = payload.keepsilent ? null : new CollectEventEmitter(this.#eventManager, {
            taskId: payload.taskId,
            batchId: payload.batchId,
            ctx: { bookId: payload.bookId, sourcePage: payload.sourcePage, infoPage: payload.infoPage },
        });

        desc.prepare?.(payload);

        try {
            const pageURL = await desc.resolveURL(this.#createCtx(), payload);
            if (pageURL === null) {
                if (payload.taskType && payload.taskType != taskType) return await this.execute(payload.taskType, payload);
                return { success: true, skipped: true, message: `[${taskType}] 没有需要处理的任务。` };
            }

            const services = { eventManager: this.#eventManager, emitter, ...this.#buildServices(desc.services) };

            // 是否需要查规则，由 descriptor 声明；无 ruleGroup 即 rules = []
            let rules = [];
            if (desc.ruleGroup != null) {
                rules = await this.#ruleService.getRulesWithGroup(pageURL, desc.ruleGroup);
            }

            const scraperType = rules.find(r => r.ruleName === RuleCommon.Scraping)?.selector
                ?? desc.scraperDefault;
            this.#_fetcher = scraperType === 'http'
                ? new AxiosDataFetcher(this.#config, new RuleEngine(), true)
                : new PuppeteerDataFetcher(this.#config, new RuleEngine(), true);

            const collector = new desc.Collector(this.#config, rules, this.#_fetcher, services);
            return await collector.fetch(this.#rangeSetting(rules), payload);

        } catch (error) {
            error.stack = `CollectExecutor::execute: ${import.meta.filename}\n${error.stack}`;
            const message = "采集任务执行失败：" + (error.message || '未知错误');
            const { batchId, taskId, ...ctx } = payload;
            emitter?.failure(desc.msgEvent, { error, ctx, message });
            throw error;
        } finally {
            await this.#_fetcher?.close?.();
        }
    }

    async close() {
        await this.#_fetcher?.close?.();
    }

    /**
     * 包装抓取规则、设置
     * @param {*} rules 
     * @returns {{ timeout?, userAgent?, dictionaries?, rules }}
     */
    #rangeSetting(rules) {
        const setting = {
            rules: rules.filter(({ ruleName }) => RULE_ALL.includes(ruleName)),
        }

        const timeout = rules.find(({ ruleName }) => RuleCommon.Timeout === ruleName);
        if (timeout?.selector) setting.timeout = timeout?.selector;
        setting.timeout = setting.timeout ?? 40_000;
        const userAgent = rules.find(({ ruleName }) => RuleCommon.UserAgent === ruleName);
        if (userAgent?.selector) setting.userAgent = userAgent?.selector;
        const dictionaries = rules.find(({ ruleName }) => RuleCommon.Dictionary === ruleName);
        if (dictionaries?.data) setting.dictionaries = dictionaries?.data;

        return setting;
    }

    #createChapterServices() {
        return {
            // chapQueryServices: new ChapterQueryService(this.#repositories.chapterRepository),
            index: { find: this.#repositories.indexRepository.findById.bind(this.#repositories.indexRepository) },
            chapCommaServices: new ChapterCommandService(this.#repositories.chapterRepository, this.#repositories.indexRepository, this.#repositories.volumeRepository, this.#transactionManager)
        }
    }

    #createWebBookServices() {
        const { webBookRepository, ebookRepository, chapterRepository, webBookChapterRepository, webBookSourceURLRepository, webBookChapterURLRepository } = this.#repositories;
        const webBookChapterService = new WebBookChapterService(this.#transactionManager, chapterRepository, webBookChapterRepository, webBookChapterURLRepository);
        const webBookQueryService = new WebBookQueryService(webBookRepository, webBookSourceURLRepository);
        return {
            webBookService: new WebBookCommandService(webBookRepository, this.#transactionManager, ebookRepository, chapterRepository, webBookSourceURLRepository, webBookChapterService),
            webBookQueryService: this.#bookQuery,
            bookQueryService: new BookQueryService(ebookRepository),
            coverService: new CoverService(this.#fileWriter, null, this.#config),
            webBookChapterService,
            webBookChapterURLService: new WebBookChapterURLService(webBookChapterURLRepository, webBookQueryService),
        }
    }

    /** 把 Executor 需要的能力以显式白名单暴露给 descriptor */
    #createCtx() {
        return this.#queryCtx;
    }

    /** 按 descriptor 声明的服务名装配，避免"按 taskType if/switch" */
    #buildServices(names = []) {
        const builders = {
            webBook: () => this.#createWebBookServices(),
            chapter: () => this.#createChapterServices(),
            storage: () => ({ storageService: this.#storageService }),
            fileWriter: () => ({ fileWriter: this.#fileWriter }),
        };
        return names.reduce((acc, n) => Object.assign(acc, builders[n]?.() ?? {}), {});
    }
}