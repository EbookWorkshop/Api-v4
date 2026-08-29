import Router from '@koa/router';
import { FontController } from "../controllers/FontController.js"
/**
 * @param {FontController} fontController 
 * @returns 
 */
export function createFontRoutes(fontController) {
    const router = new Router({ prefix: '/services/font' });

    router.get('/', (ctx) => fontController.listFonts(ctx));
    router.get('/UI', (ctx) => fontController.getUIFont(ctx));
    router.get('/reading', (ctx) => fontController.getReadingFont(ctx));

    router.post('/add', (ctx) => fontController.uploadFont(ctx));
    router.post('/rename', (ctx) => fontController.renameFont(ctx));

    router.delete('/', (ctx) => fontController.deleteFont(ctx));

    router.put('/UI', (ctx) => fontController.setUIFont(ctx));
    router.put('/reading', (ctx) => fontController.setReadingFont(ctx));

    return router;
}
