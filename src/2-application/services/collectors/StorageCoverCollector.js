import { RuleName } from "../../../3-domain/constants/Rule.js";
import { ICollector } from "../../ports/ICollector.js";
import { COLLECT_EVENTS } from "../../constants/Event.js";

/**
 * 重复封面次数阈值：超过此值时给 img 地址追加 #check
 */
const MIN_OCCURRENCE_THRESHOLD = 5;
const CHECK_SUFFIX = "#check";

/**
 * Storage 封面采集器
 *
 * 流程：
 *   1. 取一条 Storage.CoverImage 为空的记录（由 Executor 预先注入 payload.record）
 *   2. 抓取该记录的 Source 页面，套用 RuleName.BookCover 规则提取 img 地址
 *   3. 与 Storage.CoverImage 全表中出现次数 > 5 的封面比较，命中则追加 #check
 *   4. 将结果写回该记录的 CoverImage
 */
export class StorageCoverCollector extends ICollector {
    #fetcher;
    #storageService;
    #emitter;

    constructor(config, rules, fetcher, services) {
        super(config, rules, fetcher, services);
        this.#fetcher = fetcher;
        this.#storageService = services.storageService;
        this.#emitter = services.emitter;
    }

    /**
     * @param {Object} setting 抓取设置（timeout / userAgent / rules / dictionaries）
     * @param {Object} payload
     * @param {Object} payload.record Storage 记录（已在 Executor 中注入）
     */
    async fetch(setting, payload) {
        const { record } = payload;
        if (!record) {
            return this.#resultHandle(payload, true, "没有需要采集封面的记录。", {});
        }

        // 1. 抓取 Source 页面并提取 BookCover
        let coverUrl = "";
        try {
            const result = await this.#fetcher.fetch(record.Source, setting, [RuleName.BookCover]);
            const coverRsl = result.get(RuleName.BookCover);
            if (Array.isArray(coverRsl) && coverRsl[0]?.text) {
                coverUrl = coverRsl[0].text;
            } else if (coverRsl?.[0] instanceof Error) {
                return this.#resultHandle(
                    payload, false,
                    `封面提取失败：${coverRsl[0].message}`,
                    { storageId: record.id }
                );
            }
        } catch (error) {
            console.error(`封面采集失败：${error.message}`, error);
            return this.#resultHandle(
                payload, false,
                `封面采集失败：${error.message}`,
                { storageId: record.id }
            );
        }

        if (!coverUrl) {
            return this.#resultHandle(
                payload, false,
                `未能从页面提取到封面：${record.Source}`,
                { storageId: record.id }
            );
        }

        // 2. 与出现次数超过阈值的封面比对
        const frequentCovers = await this.#storageService.findFrequentCovers(MIN_OCCURRENCE_THRESHOLD);
        let finalCover = coverUrl;
        if (frequentCovers.includes(coverUrl)) {
            finalCover = coverUrl + CHECK_SUFFIX;
        }

        // 3. 写回
        await this.#storageService.updateCover(record.id, finalCover);

        return this.#resultHandle(
            payload, true,
            `已更新《${record.BookName}》的封面：${finalCover}`,
            { storageId: record.id, coverUrl: finalCover, checked: finalCover !== coverUrl }
        );
    }

    /**
     * 统一的结果/事件出口
     * @param {Object} payload
     * @param {boolean} ok
     * @param {string} message
     * @param {Object} data
     */
    #resultHandle(payload, ok, message, data = {}) {
        const ctx = { url: payload?.record?.Source };
        const event = COLLECT_EVENTS.STORAGE_COVER;

        if (ok) {
            this.#emitter?.success(event, { ctx, data, message });
        } else {
            this.#emitter?.failure(event, {
                ctx,
                error: { message },
                message,
            });
        }

        // 保持与上游（Task 完成消息 / Task.callback）的兼容返回
        return { payload, result: ok, message, data };
    }
}