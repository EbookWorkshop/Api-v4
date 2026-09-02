import { WebBookChapterURLController } from "../controllers/WebBookChapterURLController.js"
import Router from '@koa/router';

/**
 * @param {WebBookChapterURLController} webBookChapterURLController 
 * @returns 
 */
export function createWebBookChapterURLRoutes(webBookChapterURLController) {
    const router = new Router({ prefix: '/library/webbook/chapter' });
    router.get('/sources', (ctx) => webBookChapterURLController.getWebBookChapterSources(ctx));
    router.get("/source/default", (ctx) => webBookChapterURLController.getDefaultChapterSource(ctx));
    
    router.post('/sources', (ctx) => webBookChapterURLController.upsertWebBookChapterSource(ctx));

    return router;
}