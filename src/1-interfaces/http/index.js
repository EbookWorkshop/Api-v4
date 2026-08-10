/**
 * HTTP 层装配器（纯粹的接口适配，不涉及业务依赖创建）
 * 职责：挂载中间件和路由，将请求转发给已组装好的 Controllers
 */
import { registerMiddlewares } from './middlewares/index.js';
import { createMainRouter } from './routes/index.js';

export function setupHttpServer(app, config, controllers) {
  // 1. 挂载中间件
  registerMiddlewares(app, config);
  
  // 2. 挂载路由
  const router = createMainRouter(controllers);
  app.use(router.routes()).use(router.allowedMethods());
  
  return app;
}