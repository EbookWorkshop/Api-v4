/**
 * 采集域统一事件信封
 *
 * 目标：
 *   - 所有跨线程采集事件使用统一结构，接收端无需按事件定制拆包
 *   - 发送端只关心业务语义，结构细节由本模块负责
 *
 * 信封结构：
 *   {
 *     event:    string            事件名（与 emitToMain 的第一个参数一致）
 *     taskId?:  string            来源 Task ID
 *     batchId?: string            批任务 ID
 *     ctx:      CollectCtx        业务上下文（标识符集中）
 *     ok:       boolean           成功 / 失败
 *     data?:    Object            ok=true 时的业务结果
 *     error?:   SerializedError   ok=false 时的错误
 *     message?: string            人类可读摘要
 *     ts:       number            发出时间戳（ms）
 *   }
 *
 * 契约：
 *   - ok=true  →  携带 data，不携带 error
 *   - ok=false →  携带 error，不携带 data
 *   - ctx 只允许白名单字段，防止接收端拆包预期被破坏
 *
 * 使用：
 *   import { normalizeCollectEnvelope } from './envelope.js';
 *   eventManager.emitToMain(event, normalizeCollectEnvelope(event, envelope));
 */

// ============================================================
// 类型定义
// ============================================================

/**
 * 采集业务上下文
 * 所有标识符集中于此，接收端只从这里取值
 * @typedef {Object} CollectCtx
 * @property {number}  [bookId]
 * @property {string}  [bookName]
 * @property {number}  [chapterId]
 * @property {number}  [volumeId]
 * @property {string}  [url]
 * @property {string}  [sourcePage]
 * @property {string}  [infoPage]
 */

/**
 * 可序列化的错误对象
 * 保证跨线程传递后结构稳定，接收端可统一处理
 * @typedef {Object} SerializedError
 * @property {string}         message
 * @property {string}         [name]
 * @property {string}         [stack]
 * @property {string|number}  [code]
 * @property {Object}         [details]
 */

/**
 * 采集域统一事件信封
 * @typedef {Object} CollectEventEnvelope
 * @property {string}           event
 * @property {string}           [taskId]
 * @property {string}           [batchId]
 * @property {CollectCtx}       ctx
 * @property {boolean}          ok
 * @property {Object}           [data]
 * @property {SerializedError}  [error]
 * @property {string}           [message]
 * @property {number}           ts
 */

// ============================================================
// 常量
// ============================================================

/**
 * 允许出现在 ctx 中的字段白名单。
 * 不在白名单内的字段会被 normalizeCtx 丢弃，防止接收端拆包预期被破坏。
 */
const CTX_FIELDS = Object.freeze([
    'bookId',
    'bookName',
    'chapterId',
    'volumeId',
    'url',
    'sourcePage',
    'infoPage',
]);

const IS_PROD = process.env.NODE_ENV === 'production';

// ============================================================
// 内部工具
// ============================================================

/**
 * 剔除对象中值为 undefined 的键（保留 null）
 * @param {Object} obj
 * @returns {Object}
 */
function omitUndefined(obj) {
    const result = {};
    for (const key of Object.keys(obj)) {
        if (obj[key] !== undefined) result[key] = obj[key];
    }
    return result;
}

function warnDev(...args) {
    if (!IS_PROD) console.warn(...args);
}

// ============================================================
// 公开 API
// ============================================================

/**
 * 归一化错误对象为可序列化的 SerializedError
 *
 * 支持的输入形态：
 *   - Error 实例（含自定义 code / details）
 *   - 字符串
 *   - 普通对象（{ message, name, stack, code, details }）
 *   - null / undefined  →  返回默认错误
 *
 * @param {*} err
 * @returns {SerializedError}
 */
export function normalizeError(err) {
    if (err === undefined || err === null) {
        return { message: '未知错误' };
    }
    if (typeof err === 'string') {
        return { message: err };
    }
    if (err instanceof Error) {
        return omitUndefined({
            message: err.message || '未知错误',
            name: err.name,
            stack: err.stack,
            code: err.code,
            details: err.details,
        });
    }
    if (typeof err === 'object') {
        return omitUndefined({
            message: err.message || String(err),
            name: err.name,
            stack: err.stack,
            code: err.code,
            details: err.details,
        });
    }
    return { message: String(err) };
}

/**
 * 归一化 ctx：只保留白名单字段，剔除 undefined / null
 * @param {CollectCtx} [ctx]
 * @returns {CollectCtx}
 */
export function normalizeCtx(ctx) {
    if (!ctx || typeof ctx !== 'object') return {};
    const result = {};
    for (const key of CTX_FIELDS) {
        const value = ctx[key];
        if (value !== undefined && value !== null) result[key] = value;
    }
    return result;
}

/**
 * 归一化 CollectEventEnvelope
 *
 * 契约：
 *   - ok=true  →  携带 data，不携带 error
 *   - ok=false →  携带 error，不携带 data
 *
 * 传入的 envelope 若 data / error 与 ok 冲突：
 *   - 以 ok 为准
 *   - 开发模式下打印警告，帮助定位发送端 bug
 *
 * @param {string} event
 * @param {Partial<CollectEventEnvelope>} [envelope]
 * @returns {CollectEventEnvelope}
 */
export function normalizeCollectEnvelope(event, envelope = {}) {
    if (!event || typeof event !== 'string') {
        throw new TypeError('[CollectEnvelope] event 必须是非空字符串');
    }

    const ok = envelope.ok === true;

    if (ok && envelope.error !== undefined) {
        warnDev(`[CollectEnvelope] ok=true 但提供了 error，已忽略。event=${event}`);
    }
    if (!ok && envelope.data !== undefined) {
        warnDev(`[CollectEnvelope] ok=false 但提供了 data，已忽略。event=${event}`);
    }

    /** @type {CollectEventEnvelope} */
    const result = {
        event,
        ctx: normalizeCtx(envelope.ctx),
        ok,
        ts: typeof envelope.ts === 'number' ? envelope.ts : Date.now(),
    };

    if (envelope.taskId != null) result.taskId = String(envelope.taskId);
    if (envelope.batchId != null) result.batchId = String(envelope.batchId);
    if (envelope.message != null) result.message = String(envelope.message);

    if (ok) {
        result.data =
            envelope.data && typeof envelope.data === 'object'
                ? envelope.data
                : {};
    } else {
        result.error = normalizeError(envelope.error);
    }

    return result;
}

/**
 * 断言信封结构是否符合契约。
 *
 * 用于测试、灰度阶段的结构校验，以及自定义发射路径的自我保护。
 * 正式运行时不需要在每个事件上调用。
 *
 * @param {CollectEventEnvelope} envelope
 * @throws {Error} 结构不符合契约时抛出
 */
export function assertEnvelopeShape(envelope) {
    if (!envelope || typeof envelope !== 'object') {
        throw new Error('[CollectEnvelope] 信封必须是非空对象');
    }
    if (!envelope.event) {
        throw new Error('[CollectEnvelope] 缺少 event 字段');
    }
    if (typeof envelope.ok !== 'boolean') {
        throw new Error(`[CollectEnvelope] ok 必须是 boolean，event=${envelope.event}`);
    }
    if (envelope.ok && envelope.error !== undefined) {
        throw new Error(`[CollectEnvelope] ok=true 的信封不应携带 error，event=${envelope.event}`);
    }
    if (!envelope.ok && envelope.data !== undefined) {
        throw new Error(`[CollectEnvelope] ok=false 的信封不应携带 data，event=${envelope.event}`);
    }
    if (!envelope.ctx || typeof envelope.ctx !== 'object') {
        throw new Error(`[CollectEnvelope] ctx 必须是对象，event=${envelope.event}`);
    }
}