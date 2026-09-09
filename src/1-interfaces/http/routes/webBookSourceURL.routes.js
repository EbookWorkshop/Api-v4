import { WebBookSourceURLController } from "../controllers/WebBookSourceURLController.js"
import Router from '@koa/router';

/**
 * @param {WebBookSourceURLController} webBookSourceURLController 
 * @returns 
 */
export function createWebBookSourceURLRoutes(webBookSourceURLController) {
    const router = new Router({ prefix: '/library/webbook' });
    router.post('/addnewsource', (ctx) => webBookSourceURLController.addWebBookSource(ctx));
    return router;
}

export function createBotRuleRoutes(webBookSourceURLController) {
    const router = new Router({ prefix: '/services/botrule' });
    router.post('/changehostname', (ctx) => webBookSourceURLController.changeHostname(ctx));

    return router;
}