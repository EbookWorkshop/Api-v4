import Router from '@koa/router';

/**
 * @param {FontController} fontController 
 * @returns 
 */
export function createFontRoutes(fontController) {
    const router = new Router({ prefix: '/services/email' });
    router.get('/inbox', (ctx) => fontController.getInboxEmail(ctx));


    return router;
}
