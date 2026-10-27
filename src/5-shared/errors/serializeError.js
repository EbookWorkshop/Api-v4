/**
 * Error 的运行时扩展形态（业务错误子类常带 code / details / statusCode 等）
 * 只在本模块内部使用，不对外暴露
 * @typedef {Error & {
 *   code?: string | number,
 *   details?: Object,
 *   statusCode?: number,
 * }} ErrorLike
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
        const e = /** @type {ErrorLike} */ (err);
        return omitUndefined({
            message: e.message || '未知错误',
            name: e.name,
            stack: e.stack,
            code: e.code,
            details: e.details,
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