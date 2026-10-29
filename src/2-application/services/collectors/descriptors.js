import { TASK_TYPES } from '../../constants/Task.js';
import { COLLECT_EVENTS } from '../../constants/Event.js';
import { RULE_GROUP } from '../../../3-domain/constants/Rule.js';
import {
    WebBookCollector, ChapterCollector, FileCollector, CrawlerCollector,
    ListCollector, StorageCoverCollector, StorageCoverCacheCollector,
} from './index.js';

/**
 * 采集执行时暴露给 descriptor 的查询能力（白名单）
 *
 * @typedef {Object} CollectQueryCtx
 * @property {(bookId: number) => Promise<{ Path: string, Type:string}>}              getBookDefaultSource
 * @property {(chapterId: number, bookId: number) => Promise<{ Path: string }>}       getChapterDefaultSource
 * @property {(bookId: number) => Promise<string|undefined>}                          findBookName
 * @property {() => Promise<string|null>}                                             getLastListPage
 * @property {() => Promise<Object|null>}                                             findOneMissingCover
 * @property {(threshold: number) => Promise<Object|null>}                            findOneNeedingCoverCache
 */

/**
 * 采集任务描述
 *
 * @typedef {Object} CollectDescriptor
 * @property {typeof import('../../ports/ICollector.js').ICollector} Collector
 * @property {symbol|null}                                              ruleGroup
 * @property {string}                                                   msgEvent
 * @property {'puppeteer'|'http'}                                      scraperDefault
 * @property {Array<'webBook'|'chapter'|'storage'|'fileWriter'>}       services
 * @property {(payload: Object) => void}                    [prepare]   初始化
 * @property {(ctx: CollectQueryCtx, payload: Object) => Promise<string|null>} resolveURL
 */

/**
 * 任务类型 → 描述 的映射表
 * @type {Record<string, CollectDescriptor>}
 */



export const COLLECT_DESCRIPTORS = {
    [TASK_TYPES.WEB_BOOK_COLLECT]: {
        Collector: WebBookCollector,
        ruleGroup: RULE_GROUP.INFO_INDEX_PAGE,
        msgEvent: COLLECT_EVENTS.CREATE_BOOK,
        scraperDefault: 'puppeteer',
        services: ['webBook'],
        prepare: (payload) => { payload.mode = 'create'; },
        resolveURL: (_, payload) => payload.sourcePage,
    },

    [TASK_TYPES.WEB_BOOK_UPDATE_INDEX]: {
        Collector: WebBookCollector,
        ruleGroup: RULE_GROUP.INDEX_PAGE,
        msgEvent: COLLECT_EVENTS.UPDATE_INDEX,
        scraperDefault: 'puppeteer',
        services: ['webBook'],
        prepare: (payload) => { payload.mode = 'update'; },
        resolveURL: async (ctx, payload) => {
            const urlInfo = await ctx.getBookDefaultSource(payload.bookId);
            if (urlInfo.Type === "chapter") {
                payload.url = urlInfo.Path;
                payload.taskType = TASK_TYPES.WEB_BOOK_CRAWLER;
                return null;
            }
            payload.sourcePage = urlInfo.Path;
            payload.bookName = (await ctx.findBookName(payload.bookId)) ?? '';
            return urlInfo.Path;
        },
    },

    [TASK_TYPES.SINGLE_CHAPTER_COLLECT]: {
        Collector: FileCollector,
        ruleGroup: RULE_GROUP.CHAPTER_PAGE,
        msgEvent: COLLECT_EVENTS.UNKNOW,
        scraperDefault: 'puppeteer',
        services: ['fileWriter'],
        resolveURL: (_, payload) => payload.url,
    },

    [TASK_TYPES.WEB_BOOK_CHAPTER_COLLECT]: {
        Collector: ChapterCollector,
        ruleGroup: RULE_GROUP.CHAPTER_PAGE,
        msgEvent: COLLECT_EVENTS.UPDATE_CHAPTER,
        scraperDefault: 'puppeteer',
        services: ['chapter'],
        resolveURL: async (ctx, payload) => {
            const urlInfo = await ctx.getChapterDefaultSource(payload.chapterId, payload.bookId);
            payload.url = urlInfo.Path;
            return urlInfo.Path;
        },
    },

    [TASK_TYPES.WEB_BOOK_CRAWLER]: {
        Collector: CrawlerCollector,
        ruleGroup: RULE_GROUP.CHAPTER_PAGE_ALL,
        msgEvent: COLLECT_EVENTS.CRAWLER_CHAPTER,
        scraperDefault: 'puppeteer',
        services: ['webBook'],
        resolveURL: async (ctx, payload) => {
            if (payload.url) return payload.url;     //新增模式
            if (payload.bookId) {                       //已有书籍继续爬模式
                const urlInfo = await ctx.getBookDefaultSource(payload.bookId);
                return urlInfo.Path;
            }
            return null;
        },
    },

    [TASK_TYPES.WEB_BOOK_LIST_CACHE]: {
        Collector: ListCollector,
        ruleGroup: RULE_GROUP.BOOK_LIST,
        msgEvent: COLLECT_EVENTS.UNKNOW,
        scraperDefault: 'puppeteer',
        services: ['storage'],
        resolveURL: async (ctx, payload) => {
            let url = payload.url || await ctx.getLastListPage();
            if (url != payload.url) payload.url = url;
            return url;
        },
    },

    [TASK_TYPES.STORAGE_COVER_COLLECT]: {
        Collector: StorageCoverCollector,
        ruleGroup: RULE_GROUP.STORAGE_COVER,
        msgEvent: COLLECT_EVENTS.STORAGE_COVER,
        scraperDefault: 'puppeteer',
        services: ['storage'],
        resolveURL: async (ctx, payload) => {
            const record = await ctx.findOneMissingCover();
            if (!record) return null;
            payload.record = record;
            return record.Source;
        },
    },

    [TASK_TYPES.STORAGE_COVER_CACHE]: {
        Collector: StorageCoverCacheCollector,
        ruleGroup: null,                        // 本地缓存不依赖站点规则
        msgEvent: COLLECT_EVENTS.STORAGE_COVER_CACHE,
        scraperDefault: 'http',                 // 图片下载不需要 JS
        services: ['storage', 'fileWriter'],
        resolveURL: async (ctx, payload) => {
            const record = await ctx.findOneNeedingCoverCache(3);
            if (!record) return null;
            payload.record = record;
            return record.Source;
        },
    },
};