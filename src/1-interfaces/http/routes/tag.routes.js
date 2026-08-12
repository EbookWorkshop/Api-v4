import Router from '@koa/router';

export function createTagRoutes(TagController) {
  const router = new Router({ prefix: '/library' });
  router.get('/tag/list', (ctx) => TagController.listTags(ctx));
  // router.post('/', (ctx) => TagController.createTag(ctx));
  router.get("/ebooktag", ctx => TagController.ebookTags(ctx));
  return router;
}
