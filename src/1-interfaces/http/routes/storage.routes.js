import Router from '@koa/router';

export function createTagRoutes(StorageController) {
    const router = new Router({ prefix: '/library/storage' });
    router.get('/list', (ctx) => StorageController.list(ctx));
    router.get('/host', (ctx) => StorageController.listHosts(ctx));
    router.post('/search', (ctx) => StorageController.search(ctx));
    return router;
}
