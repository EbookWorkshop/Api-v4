// src/1-interfaces/http/middlewares/cors.js

/**
 * CORS 跨域中间件（接口适配层）
 * 职责：统一设置跨域响应头，处理 OPTIONS 预检请求
 */
export function createCorsMiddleware() {
    return async function cors(ctx, next) {
        // 1. 设置 CORS 响应头
        ctx.set("Access-Control-Allow-Origin", "*");
        ctx.set("Access-Control-Allow-Methods", "OPTIONS, GET, PUT, POST, DELETE, PATCH");
        ctx.set("Access-Control-Allow-Headers", "Content-Type, Access-Token, Authorization, Accept, Origin, X-Requested-With, Accept-Language, Content-Language");
        ctx.set("Access-Control-Allow-Credentials", "true");

        // 2. 如果是 OPTIONS 预检请求，直接返回 200 并终止链条
        if (ctx.request.method === 'OPTIONS') {
            ctx.status = 200;
            return;
        }

        // 3. 非 OPTIONS 请求，继续后续中间件
        await next();
    };
}