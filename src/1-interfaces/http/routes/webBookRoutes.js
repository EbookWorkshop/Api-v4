import Router from '@koa/router';

export function createWebBookRoutes(bookController) {
  const router = new Router({ prefix: '/library/webbook' });
  router.get('/list', (ctx) => bookController.listBooks(ctx));

  return router;
}
