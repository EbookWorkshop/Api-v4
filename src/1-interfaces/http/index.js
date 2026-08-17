/**
 * HTTP 层装配器
 */
import http from 'node:http';
import { registerPreResponseMiddlewares, registerPostResponseMiddlewares, createStaticServer } from './middlewares/index.js';
import { createMainRouter } from './routes/index.js';

/**
 * HTTP 层装配器（四阶段挂载）
 * 顺序：前置中间件 → 功能端点 → 后置包装器 → 业务路由
 * 职责：
 *   1. 挂载 Koa 中间件（前置、功能端点、后置）
 *   2. 挂载 Koa 路由
 *   3. 创建并返回 Node.js 原生 HTTP Server（封装了 Koa 回调）
 * 
 * @param {Koa} app - Koa 实例
 * @param {Object} config - 配置对象
 * @param {Object} controllers - 控制器映射
 * @returns {http.Server} 原生 HTTP 服务器实例（尚未监听端口）
 */
export function setupHttpServer(app, config, controllers) {
  // 1. 必须拦截每个请求的横切关注点
  registerPreResponseMiddlewares(app, config);

  // 2. 特定路径的功能端点（提前终止请求，不进入业务层）
  app.use(createStaticServer(config));

  // 3. 对正常响应进行统一格式化
  registerPostResponseMiddlewares(app, config);

  // 4. 业务逻辑路由
  const router = createMainRouter(controllers);
  app.use(router.routes()).use(router.allowedMethods());

  // 5. 创建原生 HTTP Server，绑定 Koa 的回调处理函数
  return http.createServer(app.callback());
}