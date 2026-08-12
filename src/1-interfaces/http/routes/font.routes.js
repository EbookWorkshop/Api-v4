import Router from '@koa/router';
import { FontController } from "../controllers/FontController.js"
/**
 * @param {FontController} fontController 
 * @returns 
 */
export function createFontRoutes(fontController) {
  const router = new Router({ prefix: '/services/font' });
  router.get('/UI', (ctx) => fontController.getUIFont(ctx));
  return router;
}
