import Router from '@koa/router';

/**
 * @param {ExportController} exportController 
 * @returns 
 */
export function createExportRoutes(exportController) {
    const router = new Router({ prefix: '/export' });
    router.post('/pdf', (ctx) => ctx.body = "TODO");
    router.post('/txt', (ctx) => ctx.body = "TODO");
    router.post('/epub', (ctx) => ctx.body = "TODO");

    return router;
}
