/**
 * 全局异常捕获中间件（必须放在最外层）
 * 职责：捕获所有未被 try-catch 的错误，统一返回标准错误格式
 */
export function createErrorHandlerMiddleware(config) {
    return async function errorHandler(ctx, next) {
        try {
            await next();
        } catch (err) {
            const statusCode = err.statusCode || 500;
            const message = err.message || '未知的服务器错误';

            // console.error(`[Error] ${statusCode} - ${message}`);
            // if (config.env === 'development') {
            //   console.error(err.stack);
            // }

            ctx.status = statusCode;
            ctx.body = {
                code: statusCode * 100,
                data: null,
                msg: message,
                timestamp: new Date().toISOString(),
                // 开发环境下附加堆栈信息（方便调试，生产环境将关闭）
                ...(config.env === 'development' && { stack: err.stack }),
            };
        }
    };
}