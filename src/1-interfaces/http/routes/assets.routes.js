import { AssetsController } from "../controllers/AssetsController.js"
  import Router from '@koa/router';
  
  /**
   * @param {AssetsController} assetsController 
   * @returns 
   */
  export function createAssetsRoutes(assetsController) {
      const router = new Router({ prefix: '/assets' });
      router.get('/archive/book', (ctx) => assetsController.listArchiveBooks(ctx));
  
      return router;
  }