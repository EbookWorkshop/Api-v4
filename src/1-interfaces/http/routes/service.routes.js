import { ServiceController } from "../controllers/ServiceController.js"
import Router from '@koa/router';

/**
 * @param {ServiceController} serviceController 
 * @returns 
 */
export function createServiceRoutes(serviceController) {
    const router = new Router({ prefix: '/services' });
    router.get('/message', (ctx) => ctx.body="TODO: /services/message");
    router.get('/version', (ctx) => serviceController.getVersion(ctx));
    router.get('/checkSiteAccessibility', (ctx) => serviceController.checkSiteAccessibility(ctx));
    router.post('/version', (ctx) => serviceController.updateVersion(ctx));
    
    router.post('/compress_db', (ctx) => serviceController.compressDatabase(ctx));
    return router;
}