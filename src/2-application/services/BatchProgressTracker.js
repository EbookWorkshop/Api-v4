/**
 * 批任务进度跟踪器（主线程）
 *
 * 职责：
 *   - 维护批次状态（注册、计数、完成判定）
 *   - 节流广播进度（200ms 合并，完成时立即广播）
 *   - 提供状态查询
 *   - TTL 清理
 *
 * 非职责：
 *   - 事件拆包（由 CollectEventEmitter 保证）
 *   - 调度（由 TaskSchedulerService 承担）
 *   - WebSocket 广播（由 handler 承担）
 */

import { emitCollect } from '../events/collectEvents.js';
import { COLLECT_EVENTS } from '../constants/Event.js';

/** 进度广播最小间隔（ms） */
const PROGRESS_THROTTLE_MS = 200;
/** 完成批次保留时间（ms），供前端断线重连后查询 */
const FINISHED_TTL_MS = 10 * 60_000;

/**
 * @typedef {Object} BatchMeta
 * @property {string}   type        任务类型（TASK_TYPES.*）
 * @property {number}   bookId
 * @property {string}   [bookName]
 * @property {number[]} chapterIds  完整章节 ID 列表
 */

/**
 * @typedef {Object} BatchProgressSnapshot
 * @property {string}   batchId
 * @property {string}   type
 * @property {number}   bookId
 * @property {string}   bookName
 * @property {number}   total
 * @property {number}   done
 * @property {number}   success
 * @property {number}   fail
 * @property {number}   percent
 * @property {string}   status     running | completed | partial
 * @property {number}   startedAt
 * @property {number}   updatedAt
 */

export class BatchProgressTracker {
    /** @type {Map<string, Object>} */
    #batches;
    #eventManager;

    /**
     * @param {EventManager} eventManager
     */
    constructor(eventManager) {
        if (!eventManager) {
            throw new TypeError('[BatchProgressTracker] 需要有效的 EventManager');
        }
        this.#eventManager = eventManager;
        this.#batches = new Map();
    }

    // ============================================================
    // 生命周期
    // ============================================================

    /**
     * 注册一个批次
     * @param {string} batchId
     * @param {BatchMeta} meta
     */
    register(batchId, meta) {
        if (this.#batches.has(batchId)) {
            console.warn(`[BatchProgressTracker] 批次已存在，忽略重复注册：${batchId}`);
            return;
        }

        const { type, bookId, bookName, chapterIds } = meta || {};
        if (!Array.isArray(chapterIds)) {
            throw new TypeError('[BatchProgressTracker] chapterIds 必须是数组');
        }

        const now = Date.now();
        const batch = {
            batchId,
            type: type || 'unknown',
            bookId,
            bookName: bookName || '',
            chapterIds: [...chapterIds],
            total: chapterIds.length,
            done: 0,
            success: 0,
            fail: 0,
            status: 'running',
            settledChapterIds: new Set(),
            startedAt: now,
            updatedAt: now,
            lastEmitAt: 0,
            progressTimer: null,
            cleanupTimer: null,
        };

        this.#batches.set(batchId, batch);

        // 立即广播一次 0% 进度，让前端拿到 total
        this.#emitProgress(batch, true);
    }

    /**
     * 单个子任务完结时调用（幂等）
     *
     * 成功判定：
     *   - 有 error            → 失败
     *   - data.result === true → 成功
     *   - 其它                → 失败
     *
     * @param {string} batchId
     * @param {number} chapterId
     * @param {{ data?: Object, error?: Object }} settled
     */
    onTaskSettled(batchId, chapterId, settled = {}) {
        const batch = this.#batches.get(batchId);
        if (!batch || batch.status !== 'running') return;

        // 幂等：重试、重复完成只计一次
        if (batch.settledChapterIds.has(chapterId)) return;
        batch.settledChapterIds.add(chapterId);

        const ok = !settled.error && settled.data?.result === true;

        batch.done++;
        if (ok) batch.success++;
        else batch.fail++;
        batch.updatedAt = Date.now();

        if (batch.done >= batch.total) {
            this.#finalize(batch);
        } else {
            this.#scheduleProgress(batch);
        }
    }

    // ============================================================
    // 查询
    // ============================================================

    /**
     * 获取批次状态快照
     * @param {string} batchId
     * @returns {BatchProgressSnapshot|null}
     */
    getStatus(batchId) {
        const batch = this.#batches.get(batchId);
        if (!batch) return null;
        return this.#snapshot(batch);
    }

    /**
     * 列出正在运行的批次
     * @returns {BatchProgressSnapshot[]}
     */
    listRunning() {
        const result = [];
        for (const batch of this.#batches.values()) {
            if (batch.status === 'running') result.push(this.#snapshot(batch));
        }
        return result;
    }

    // ============================================================
    // 内部
    // ============================================================

    #scheduleProgress(batch) {
        const now = Date.now();
        const elapsed = now - batch.lastEmitAt;

        if (elapsed >= PROGRESS_THROTTLE_MS) {
            this.#emitProgress(batch, false);
            return;
        }
        if (batch.progressTimer) return;

        const wait = PROGRESS_THROTTLE_MS - elapsed;
        batch.progressTimer = setTimeout(() => {
            batch.progressTimer = null;
            if (batch.status === 'running') this.#emitProgress(batch, false);
        }, wait);
    }

    #emitProgress(batch, force) {
        const now = Date.now();
        batch.lastEmitAt = now;

        emitCollect(this.#eventManager, COLLECT_EVENTS.UPDATE_CHAPTER_BATCH_PROGRESS, {
            batchId: batch.batchId,
            ctx: {
                bookId: batch.bookId,
                bookName: batch.bookName,
            },
            ok: true,
            data: this.#snapshot(batch),
            message: `进度 ${batch.done}/${batch.total}`,
        });
    }

    #finalize(batch) {
        batch.status = batch.fail > 0 ? 'partial' : 'completed';

        if (batch.progressTimer) {
            clearTimeout(batch.progressTimer);
            batch.progressTimer = null;
        }

        emitCollect(this.#eventManager, COLLECT_EVENTS.UPDATE_CHAPTER_BATCH_FINISH, {
            batchId: batch.batchId,
            ctx: {
                bookId: batch.bookId,
                bookName: batch.bookName,
                batchId: batch.batchId,
            },
            ok: true,
            data: {
                chapterIds: batch.chapterIds,
                total: batch.total,
                doneNum: batch.success,
                failNum: batch.fail,
                status: batch.status,
            },
            message: batch.status === 'completed'
                ? `批量更新完成，共 ${batch.success} 章`
                : `批量更新完成，成功 ${batch.success} 章，失败 ${batch.fail} 章`,
        });

        batch.cleanupTimer = setTimeout(() => {
            this.#batches.delete(batch.batchId);
        }, FINISHED_TTL_MS);
    }

    #snapshot(batch) {
        return {
            batchId: batch.batchId,
            type: batch.type,
            bookId: batch.bookId,
            bookName: batch.bookName,
            total: batch.total,
            done: batch.done,
            success: batch.success,
            fail: batch.fail,
            percent: batch.total > 0
                ? Math.floor((batch.done / batch.total) * 100)
                : 0,
            status: batch.status,
            startedAt: batch.startedAt,
            updatedAt: batch.updatedAt,
        };
    }

    /**
     * 优雅关闭，清理所有定时器
     */
    close() {
        for (const batch of this.#batches.values()) {
            if (batch.progressTimer) clearTimeout(batch.progressTimer);
            if (batch.cleanupTimer) clearTimeout(batch.cleanupTimer);
        }
        this.#batches.clear();
    }
}