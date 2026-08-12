/**
 * HTTP 层装配器
 * 顺序：前置中间件 → 功能端点 → 后置包装器 → 业务路由
 */
import { registerPreResponseMiddlewares, registerPostResponseMiddlewares, createStaticServer, createSwaggerUI } from './middlewares/index.js';
import { createMainRouter } from './routes/index.js';

export function setupHttpServer(app, config, controllers) {
  // 1. 必须拦截每个请求的横切关注点
  registerPreResponseMiddlewares(app, config);

  // 2. 特定路径的功能端点（提前终止请求，不进入业务层）
  app.use(createStaticServer(config));
  app.use(createSwaggerUI(config));

  // 3. 对正常响应进行统一格式化
  registerPostResponseMiddlewares(app, config);

  // 4. 业务逻辑路由
  const router = createMainRouter(controllers);
  app.use(router.routes()).use(router.allowedMethods());

  return app;
}