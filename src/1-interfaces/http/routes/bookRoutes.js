import Router from '@koa/router';

export function createBookRoutes(bookController) {
  const router = new Router({ prefix: '/library' });
  router.get('/booklist', (ctx) => bookController.listBooks(ctx));
  router.post('/', (ctx) => bookController.createBook(ctx));
  return router;
}
