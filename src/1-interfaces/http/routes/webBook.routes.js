import Router from '@koa/router';
import { WebBookController } from '../controllers/WebBookController.js';

/**
 * 
 * @param {WebBookController} bookController 
 * @returns 
 */
export function createWebBookRoutes(bookController) {
    const router = new Router({ prefix: '/library/webbook' });
    router.get('/list', (ctx) => bookController.listBooks(ctx));
    router.get('/', (ctx) => bookController.getBookById(ctx));
    
    router.delete('/', (ctx) => bookController.deleteBook(ctx));
    return router;
}
