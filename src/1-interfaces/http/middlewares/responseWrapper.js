/**
 * 成功响应包装中间件    
 * 职责：将 Controller 返回的原始数据（ctx.body）包装为统一格式
 * 注意：必须在路由中间件之前挂载（利用 Koa 的洋葱模型，在 await next() 之后拦截）
 */
export function createResponseWrapperMiddleware() {
    return async function responseWrapper(ctx, next) {
        // 1. 先执行后续中间件（路由 -> Controller -> Service）
        await next();   //不捕获处理错误，出错时会由错误处理中间件捕获。

        if (ctx.body instanceof Promise) {
            console.error("错误返回了未完成的Promise:", ctx.method, ctx.href)
            ctx.body = await ctx.body;
        }

        // 2. 拦截已经设置好的响应体
        // 仅处理成功的 2xx 响应，且 body 存在且未被显式跳过包装
        if (
            ctx.body !== undefined &&
            ctx.body !== null &&
            ctx.status >= 200 &&
            ctx.status < 300 &&
            !ctx.state.skipResponseWrapper // 允许某些接口跳过包装（如文件下载）
        ) {
            // 如果业务层已经返回了标准格式（如健康检查），则跳过双重包装
            if (ctx.body.code !== undefined && ctx.body.data !== undefined) { return; }

            // 执行标准化包装
            ctx.body = {
                code: 20000,
                data: ctx.body,
                msg: 'success',
                timestamp: new Date().toISOString(), // 可选：方便前端定位时间
            };
        }
    };
}