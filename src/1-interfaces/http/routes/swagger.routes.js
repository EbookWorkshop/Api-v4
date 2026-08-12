import Router from '@koa/router';

import { SwaggerController } from '../controllers/SwaggerController.js';

/**
 * 
 * @param {SwaggerController} swaggerController 
 * @returns 
 */
export function createSwaggerRoutes(swaggerController) {
  const router = new Router({ prefix: '/swagger' });
  router.get('/', (ctx) => { ctx.body = "OK" });
  router.get('.json', (ctx) => swaggerController.getJSONFile(ctx));
  router.get('-ui-dist', (ctx) => swaggerController.getUIDist(ctx));
  router.get('/scalar', (ctx) => swaggerController.getScalar(ctx));
  router.get('/stoplight', (ctx) => swaggerController.getStoplight(ctx));

  return router;
}
