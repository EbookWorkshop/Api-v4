import Router from '@koa/router';

/**
 * @param {ExportController} exportController 
 * @returns 
 */
export function createExportRoutes(exportController) {
    const router = new Router({ prefix: '/export' });
    router.post('/pdf', (ctx) => exportController.exportPdf(ctx));
    router.post('/txt', (ctx) => exportController.exportTxt(ctx));
    router.post('/epub', (ctx) => exportController.exportEpub(ctx));

    return router;
}
