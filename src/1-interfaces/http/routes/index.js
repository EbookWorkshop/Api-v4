import Router from '@koa/router';
import { createBookRoutes } from './bookRoutes.js';
import { createChapterRoutes } from "./chapterRoutes.js";
import { createTagRoutes } from './tagRoutes.js';
import { createFontRoutes } from './fontRoutes.js';
import { createWebBookRoutes } from './webBookRoutes.js';

/**
 * 
 * @param {*} controllers 
 * @returns 
 */
export function createMainRouter(controllers) {
  const router = new Router();//{ prefix: '/api' }

  // 注册各模块路由
  const bookRouter = createBookRoutes(controllers.book);
  router.use(bookRouter.routes());
  router.use(bookRouter.allowedMethods());

  const webBookRouter = createWebBookRoutes(controllers.webBook);
  router.use(webBookRouter.routes());
  router.use(webBookRouter.allowedMethods());

  const chapterRouter = createChapterRoutes(controllers.chapter);
  router.use(chapterRouter.routes());
  router.use(chapterRouter.allowedMethods());

  const tagRouter = createTagRoutes(controllers.tag);
  router.use(tagRouter.routes());
  router.use(tagRouter.allowedMethods());

  const fontRouter = createFontRoutes(controllers.font);
  router.use(fontRouter.routes());
  router.use(fontRouter.allowedMethods());

  // 健康检查
  router.get('/health', (ctx) => {
    ctx.body = { status: 'ok', timestamp: new Date().toISOString() };
  });

  return router;
}

