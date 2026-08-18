import Router from '@koa/router';
import { FontController } from "../controllers/FontController.js"
/**
 * @param {FontController} fontController 
 * @returns 
 */
export function createFontRoutes(fontController) {
  const router = new Router({ prefix: '/services/font' });
  router.get('/', (ctx) => fontController.getFontList(ctx));
  router.get('/UI', (ctx) => fontController.getUIFont(ctx));
  router.get('/reading', (ctx) => fontController.getFontReading(ctx));

  return router;
}
