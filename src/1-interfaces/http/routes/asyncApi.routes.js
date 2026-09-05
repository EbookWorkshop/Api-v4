import { AsyncApiController } from "../controllers/AsyncApiController.js"
import Router from '@koa/router';

/**
 * @param {AsyncApiController} asyncApiController 
 * @returns 
 */
export function createAsyncApiRoutes(asyncApiController) {
    const router = new Router({ prefix: '/asyncapi' });
    router.get('.json', (ctx) => asyncApiController.getDoc(ctx));
    router.get('/scalar', (ctx) => asyncApiController.getScalar(ctx));
    router.get('/studio', (ctx) => asyncApiController.getStudio(ctx));
    return router;
}