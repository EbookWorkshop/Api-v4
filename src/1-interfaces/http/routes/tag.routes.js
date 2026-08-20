import Router from '@koa/router';

export function createTagRoutes(TagController) {
  const router = new Router({ prefix: '/library' });
  router.get('/tag/list', (ctx) => TagController.listTags(ctx));
  router.get("/ebooktag", ctx => TagController.ebookTags(ctx));

  router.post('/tag', (ctx) => TagController.createTag(ctx));

  router.delete('/tag', (ctx) => TagController.deleteTag(ctx));
  router.delete('/tagonbook', (ctx) => TagController.removeTagFromBook(ctx));

  router.put('/tag', (ctx) => TagController.updateTag(ctx));

  return router;
}
