/**
 * 采集域上下文绑定式事件发射器
 *
 * 职责：
 *   - 绑定 taskId / batchId / ctx，避免在每个发送点重复书写
 *   - 提供 start / success / failure 三个语义化动词
 *   - 通过 emitCollect 投递统一信封
 *
 * 非职责：
 *   - 信封归一化（由 envelope.js 承担）
 *   - 事件路由（由 EventManager 承担）
 */

import { emitCollect } from './collectEvents.js';

export class CollectEventEmitter {
    #eventManager;
    #taskId;
    #batchId;
    #ctx;

    /**
     * @param {EventManager} eventManager
     * @param {{
     *   taskId?: string,
     *   batchId?: string,
     *   ctx?: import('./envelope.js').CollectCtx
     * }} [context]
     */
    constructor(eventManager, context = {}) {
        this.#eventManager = eventManager;
        this.#taskId = context.taskId;
        this.#batchId = context.batchId;
        this.#ctx = { ...(context.ctx || {}) };
    }

    /**
     * 派生出携带更多上下文的新 emitter
     * ctx 一层浅合并，taskId / batchId 允许覆盖
     * @param {{ taskId?: string, batchId?: string, ctx?: Object }} extra
     * @returns {CollectEventEmitter}
     */
    with(extra = {}) {
        return new CollectEventEmitter(this.#eventManager, {
            taskId: extra.taskId ?? this.#taskId,
            batchId: extra.batchId ?? this.#batchId,
            ctx: { ...this.#ctx, ...(extra.ctx || {}) },
        });
    }

    /**
     * 任务开始事件（无 data、无 error）
     */
    start(event, { ctx = {}, message = '' } = {}) {
        return this.#send(event, { ctx, ok: true, data: {}, message });
    }

    /**
     * 任务成功事件
     */
    success(event, { ctx = {}, data = {}, message = '' } = {}) {
        return this.#send(event, { ctx, ok: true, data, message });
    }

    /**
     * 任务失败事件
     * @param {*} error 任意错误输入，由 normalizeError 归一化
     */
    failure(event, { ctx = {}, error, message = '' } = {}) {
        return this.#send(event, { ctx, ok: false, error, message });
    }

    #send(event, envelope) {
        return emitCollect(this.#eventManager, event, {
            taskId: this.#taskId,
            batchId: this.#batchId,
            ctx: { ...this.#ctx, ...envelope.ctx },
            ok: envelope.ok,
            data: envelope.data,
            error: envelope.error,
            message: envelope.message,
        });
    }
}