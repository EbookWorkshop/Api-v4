import Router from '@koa/router';

import { SwaggerController } from '../controllers/SwaggerController.js';

/**
 * 
 * @param {SwaggerController} swaggerController 
 * @returns 
 */
export function createSwaggerRoutes(swaggerController) {
    const router = new Router({ prefix: '/swagger' });
    router.get('/', (ctx) => swaggerController.getSwaggerUI(ctx));
    router.get('.json', (ctx) => swaggerController.getJSONFile(ctx));
    router.get('/openapi-ui-dist', (ctx) => swaggerController.getOpenUIDist(ctx));
    router.get('/scalar', (ctx) => swaggerController.getScalar(ctx));
    router.get('/stoplight', (ctx) => swaggerController.getStoplight(ctx));
    router.get('/rapidoc', (ctx) => swaggerController.getRapiDoc(ctx));
    router.get('/redoc', (ctx) => swaggerController.getReDoc(ctx));

    return router;
}
