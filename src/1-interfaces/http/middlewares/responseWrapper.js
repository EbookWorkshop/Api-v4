/**
 * 成功响应包装中间件    
 * 职责：将 Controller 返回的原始数据（ctx.body）包装为统一格式
 * 注意：必须在路由中间件之前挂载（利用 Koa 的洋葱模型，在 await next() 之后拦截）
 */
export function createResponseWrapperMiddleware() {
  return async function responseWrapper(ctx, next) {
    // 1. 先执行后续中间件（路由 -> Controller -> Service）
    try {
      await next();
    } catch (error) {
      console.error("接口请求失败：", error);
      console.trace();
    }

    // 2. 设置响应头
    ctx.set("Access-Control-Allow-Origin", "*");
    ctx.set("Access-Control-Allow-Methods", "OPTIONS, GET, PUT, POST, DELETE, PATCH");
    ctx.set("Access-Control-Allow-Headers", "Content-Type,Access-Token,Authorization,Accept,Origin,X-Requested-With,Accept-Language,Content-Language");
    ctx.set("Access-Control-Allow-Credentials", true);
    if (ctx.request.method === 'OPTIONS') { // 直接响应数据 应对axios的跨域探测
      ctx.status = 200;
    }

    // 3. 拦截已经设置好的响应体
    // 仅处理成功的 2xx 响应，且 body 存在且未被显式跳过包装
    if (
      ctx.body !== undefined &&
      ctx.body !== null &&
      ctx.status >= 200 &&
      ctx.status < 300 &&
      !ctx.state.skipResponseWrapper // 允许某些接口跳过包装（如文件下载）
    ) {
      // 如果业务层已经返回了标准格式（如健康检查），则跳过双重包装
      if (ctx.body.code !== undefined && ctx.body.data !== undefined) {
        return;
      }

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