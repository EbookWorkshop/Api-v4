import Router from '@koa/router';
import { createBookRoutes } from './bookRoutes.js';
import { createTagRoutes } from './tagRoutes.js';

export function createMainRouter(controllers) {
  const router = new Router();//{ prefix: '/api' }

  // 注册各模块路由
  const bookRouter = createBookRoutes(controllers.book);
  router.use(bookRouter.routes());
  router.use(bookRouter.allowedMethods());

  const tagRouter = createTagRoutes(controllers.tag);
  router.use(tagRouter.routes());
  router.use(tagRouter.allowedMethods());

  // 健康检查
  router.get('/health', (ctx) => {
    ctx.body = { status: 'ok', timestamp: new Date().toISOString() };
  });

  return router;
}

