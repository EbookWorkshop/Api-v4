import Router from '@koa/router';

export function createBookRoutes(bookController) {
  const router = new Router({ prefix: '/library' });
  router.get('/booklist', (ctx) => bookController.listBooks(ctx));
  router.get("/book", (ctx) => bookController.getBookById(ctx));
  router.get("/book/metadata", (ctx) => bookController.getMetadata(ctx));

  router.post("/book", (ctx) => bookController.createBook(ctx));
  router.post('/book/heat', (ctx) => bookController.updateBookHeat(ctx));
  router.post('/emptybook', (ctx) => bookController.createEmptyBook(ctx));

  router.delete("/book", (ctx) => bookController.deleteBook(ctx));
  return router;
}
