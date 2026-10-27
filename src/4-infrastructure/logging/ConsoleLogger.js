// src/4-infrastructure/logging/ConsoleLogger.js
import { ILogger } from '../../2-application/ports/ILogger.js';

/**
 * 控制台日志适配器（实现 ILogger 端口）
 * 职责：将格式化后的日志字符串输出到 Node.js 原生 console
 *
 * 设计约束：
 * 1. 绝不调用 logger 本身（避免递归）
 * 2. 不负责格式化、不负责级别过滤（那是 Log 类的职责）
 * 3. 仅做"字符串 → console 方法"的映射
 */
export class ConsoleLogger extends ILogger {
    /**
     * @param {Object} [options]
     */
    constructor(options = {}) {
        super();
    }

    /**
     * 写入日志
     * @param {'error'|'warn'|'info'|'log'|'debug'} type - 日志类型（已由 Log 类校验）
     * @param {string} message - 已格式化的日志字符串
     * @returns {void}
     */
    write(type, message) {
        const logApi = console[type] ?? console.log;
        return logApi(message);
    }
}