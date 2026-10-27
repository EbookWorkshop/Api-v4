import { performance } from 'node:perf_hooks';
import { logger } from '../../../5-shared/logging/index.js';

/**
 * 创建 Koa 日志中间件（接口适配层）
 * @param {Object} config - 从组合根传入的配置对象（包含 debug 模式）
 * @returns {Function} Koa 中间件函数
 */
export function createLoggerMiddleware(config) {
    const isDebug = config.debug?.mode || false;
    // const logLevel = config.debug?.level || 'info';
    // const requireLog = config.debug?.switch?.requireLog || false;

    return async function _logger(ctx, next) {
        // 1. 记录请求开始时间（使用高精度时间）
        const startTime = performance.now();

        // 2. 记录请求基本信息（用于日志上下文）
        const { method, url } = ctx;
        // const userAgent = headers['user-agent'] || 'unknown';

        // 3. 执行后续中间件（路由 + 业务逻辑）
        try {
            await next();
        } catch (err) {
            if (isDebug) {
                //处理父级错误
                if (err.original || err.parent) {
                    const preErr = err.original || err.parent;//上级错误
                    const serialized = {
                        name: preErr.name || '原始错误/父级错误',
                        message: preErr.message || '',
                        stack: preErr.stack || '',
                    };

                    for (const key of Object.keys(preErr)) {
                        if (key === 'name' || key === 'message' || key === 'stack') {
                            continue;
                        }
                        serialized[key] = preErr[key];
                    }
                    logger.warn(serialized);
                }

                // 即使业务逻辑抛出异常，也要记录错误日志，并确保错误继续向上抛出（由全局错误处理中间件接管）
                // 但为了不让日志丢失，这里捕获后重新抛出
                const duration = (performance.now() - startTime).toFixed(2);
                logger.error(
                    `HTTP 请求异常：${method} ${url} - ${ctx.status || 500} - ${duration}ms - ${err.message}`
                );
                logger.log(err.stack);
            }
            throw err; // 继续抛出，让上层错误中间件处理
        }

        // 4. 计算耗时并输出日志
        const duration = (performance.now() - startTime).toFixed(2);
        const status = ctx.status || 404;

        if (status >= 500) logger.error(`... ${method} ${url} - ${status} - ${duration}ms`);
        else if (status >= 400) logger.warn(`... ${method} ${url} - ${status} - ${duration}ms`);
        else logger.debug(`... ${method} ${url} - ${status} - ${duration}ms`);


        // 可选：挂载响应头 X-Response-Time（便于前端调试）
        ctx.set('X-Response-Time', `${duration}ms`);
    };
}