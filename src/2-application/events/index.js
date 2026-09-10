/**
 * 采集事件协议模块 - 公共入口
 *
 * 本模块提供采集域跨线程事件的统一协议，包括：
 *   - 信封规范与归一化（envelope.js）
 *   - 事件投递入口（collectEvents.js）
 *   - 上下文绑定式发射器（CollectEventEmitter.js）
 *
 * 分层使用建议：
 *   - 业务代码（Collector / Executor）优先使用 CollectEventEmitter
 *   - 需要手工组装信封时（测试、回放、离线补发）使用 emitCollect
 *   - 接收端只需要认识 CollectEventEnvelope 结构，无需导入本模块
 *
 * 类型定义（JSDoc）：
 *   @typedef {import('./envelope.js').CollectEventEnvelope} CollectEventEnvelope
 *   @typedef {import('./envelope.js').CollectCtx} CollectCtx
 *   @typedef {import('./envelope.js').SerializedError} SerializedError
 */

// ============================================================
// 信封规范与归一化
// ============================================================

export {
    // 归一化入口：把任意输入收敛为合法信封
    normalizeCollectEnvelope,
    // 错误归一化：其它子域（导出、压缩）可复用
    normalizeError,
    // 上下文白名单过滤：测试与自定义发射器可复用
    normalizeCtx,
    // 契约断言：测试、灰度校验、自定义发射路径使用
    assertEnvelopeShape,
} from './envelope.js';

// ============================================================
// 事件投递入口
// ============================================================

export {
    // 低层投递：归一化 + emitToMain
    // 优先使用 CollectEventEmitter；本函数用于手工组装场景
    emitCollect,
} from './collectEvents.js';

// ============================================================
// 上下文绑定式发射器
// ============================================================

export {
    // 业务友好 API：绑定 taskId / batchId / ctx，暴露 start / success / failure
    CollectEventEmitter,
} from './CollectEventEmitter.js';