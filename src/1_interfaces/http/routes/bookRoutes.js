import Router from '@koa/router';

export function createBookRoutes(bookController) {
  const router = new Router({ prefix: '/books' });
  router.get('/', (ctx) => bookController.listBooks(ctx));
  // 未来可添加更多路由
  return router;
}
