// src/1_interfaces/http/middlewares/logger.js
import { performance } from 'node:perf_hooks';

/**
 * 创建 Koa 日志中间件（接口适配层）
 * @param {Object} config - 从组合根传入的配置对象（包含 debug 模式）
 * @returns {Function} Koa 中间件函数
 */
export function createLoggerMiddleware(config) {
    const isDebug = config.debug?.mode || false;
    const logLevel = config.debug?.level || 'info';

    return async function logger(ctx, next) {
        // 1. 记录请求开始时间（使用高精度时间）
        const startTime = performance.now();

        // 2. 记录请求基本信息（用于日志上下文）
        const { method, url, ip, headers } = ctx;
        const userAgent = headers['user-agent'] || 'unknown';

        // 3. 执行后续中间件（路由 + 业务逻辑）
        try {
            await next();
        } catch (err) {
            // 即使业务逻辑抛出异常，也要记录错误日志，并确保错误继续向上抛出（由全局错误处理中间件接管）
            // 但为了不让日志丢失，这里捕获后重新抛出
            const duration = (performance.now() - startTime).toFixed(2);
            console.error(
                `[ERROR] ${new Date().toISOString()} ${method} ${url} - ${ctx.status || 500} - ${duration}ms - ${err.message}`
            );
            throw err; // 继续抛出，让上层错误中间件处理
        }

        // 4. 计算耗时并输出日志
        const duration = (performance.now() - startTime).toFixed(2);
        const status = ctx.status || 404;

        // 根据配置决定是否输出日志（生产环境只输出 4xx/5xx，开发环境全量输出）
        const shouldLog = isDebug || status >= 400;

        if (shouldLog) {
            // 根据日志级别决定输出格式（简单 vs 详细）
            if (logLevel === 'debug') {
                console.log(
                    `[${new Date().toISOString()}] ${method} ${url} - ${status} - ${duration}ms - ${ip} - ${userAgent}`
                );
            } else {
                // info 级别只输出精简信息
                console.log(`[${new Date().toISOString()}] ${method} ${url} - ${status} - ${duration}ms`);
            }
        }

        // 可选：挂载响应头 X-Response-Time（便于前端调试）
        ctx.set('X-Response-Time', `${duration}ms`);
    };
}