import Router from '@koa/router';

export function createTagRoutes(TagController) {
  const router = new Router({ prefix: '/library/tag' });
  router.get('/list', (ctx) => TagController.listTags(ctx));
  // router.post('/', (ctx) => TagController.createTag(ctx));
  return router;
}
