import { ServiceController } from "../controllers/ServiceController.js"
import Router from '@koa/router';

/**
 * @param {ServiceController} serviceController 
 * @returns 
 */
export function createServiceRoutes(serviceController) {
    const router = new Router({ prefix: '/services' });
    router.get('/version', (ctx) => serviceController.getVersion(ctx));
    router.get('/checkSiteAccessibility', (ctx) => serviceController.checkSiteAccessibility(ctx));

    return router;
}