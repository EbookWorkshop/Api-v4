/**
 * 采集域事件投递入口
 *
 * 职责：
 *   - 归一化采集事件信封（委托 envelope.js）
 *   - 通过 EventManager.emitToMain 投递到主线程
 *
 * 非职责：
 *   - 上下文绑定（由 CollectEventEmitter 承担）
 *   - 语义化动词（start / success / failure）
 *   - 事件路由与广播（由 EventManager 与 WebSocket handler 承担）
 *
 * 使用场景：
 *   - 需要直接发送一个已完整的信封时使用
 *   - CollectEventEmitter 内部也通过本函数投递
 *   - 单元测试、日志回放、离线补发等低级场景
 *
 * 示例：
 *   import { emitCollect } from '../../events/collectEvents.js';
 *   emitCollect(eventManager, COLLECT_EVENTS.UPDATE_CHAPTER, {
 *     taskId,
 *     batchId,
 *     ctx: { bookId, chapterId },
 *     ok: true,
 *     data: {},
 *     message: '已完成章节采集',
 *   });
 */

import { normalizeCollectEnvelope } from './envelope.js';

/**
 * 归一化并投递一个采集事件信封
 *
 * @param {EventManager} eventManager
 *        主线程 EventManager 实例。若在子线程调用，
 *        emitToMain 会通过 parentPort 转发到主线程。
 *
 * @param {string} event
 *        事件名，应为 COLLECT_EVENTS.* 中的常量。
 *
 * @param {Partial<CollectEventEnvelope>} envelope
 *        原始信封。允许字段不全，由 normalizeCollectEnvelope 补齐。
 *        契约：ok=true 时提供 data，ok=false 时提供 error，
 *        两者不可同时提供。
 *
 * @returns {CollectEventEnvelope}
 *        归一化后的信封（便于调用方后续使用或断言）。
 */
export function emitCollect(eventManager, event, envelope) {
    if (!eventManager || typeof eventManager.emitToMain !== 'function') {
        throw new TypeError('[emitCollect] 需要有效的 EventManager 实例');
    }

    const normalized = normalizeCollectEnvelope(event, envelope);
    eventManager.emitToMain(event, normalized);
    return normalized;
}