import Router from '@koa/router';

/**
 * @returns 
 */
export function createImportRoutes(importController) {
    const router = new Router({ prefix: '/import' });
    router.post('/add', (ctx) => importController.add(ctx));
    return router;
}
