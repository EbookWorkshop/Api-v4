import Router from '@koa/router';

export function createBookRoutes(bookController) {
  const router = new Router({ prefix: '/library' });
  router.get('/booklist', (ctx) => bookController.listBooks(ctx));
  router.get("/book",(ctx)=>bookController.queryBook(ctx));
  router.get("/book/metadata",(ctx)=>bookController.getMetadata(ctx));

  router.post('/book/heat', (ctx) => bookController.updateBookHeat(ctx));
  return router;
}
