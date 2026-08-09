import Router, { RouterEvents } from '@koa/router';
import { createBookRoutes } from './bookRoutes.js';

export function createMainRouter(controllers) {
  const router = new Router({ prefix: '/api' });

  // 注册各模块路由
  const bookRouter = createBookRoutes(controllers.bookController);
  router.use(bookRouter.routes());
  router.use(bookRouter.allowedMethods()); // ✅ 405 自动处理

  // 健康检查
  router.get('/health', (ctx) => {
    ctx.body = { status: 'ok', timestamp: new Date().toISOString() };
  });

  return router;
}

