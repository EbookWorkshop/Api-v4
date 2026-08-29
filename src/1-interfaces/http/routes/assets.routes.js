import { AssetsController } from "../controllers/AssetsController.js"
import Router from '@koa/router';

/**
 * @param {AssetsController} assetsController 
 * @returns 
 */
export function createAssetsRoutes(assetsController) {
    const router = new Router({ prefix: '/assets' });
    router.get('/archive/book', (ctx) => assetsController.listArchiveBooks(ctx));
    router.post('/archive/book', (ctx) => assetsController.renameFile(ctx));

    router.delete('/archive/book/:name', (ctx) => assetsController.deleteArchiveFile(ctx));
    return router;
}