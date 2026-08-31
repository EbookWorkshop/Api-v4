import Router from '@koa/router';
import { WebBookController } from '../controllers/WebBookController.js';

/**
 * 
 * @param {WebBookController} bookController 
 * @returns 
 */
export function createWebBookRoutes(bookController) {
    const router = new Router({ prefix: '/library/webbook' });
    router.get('/', (ctx) => bookController.getBookById(ctx));
    router.get('/list', (ctx) => bookController.listBooks(ctx));
    router.get('/sources', (ctx) => bookController.getWebBookSources(ctx));
    router.get('/defsources', (ctx) => bookController.getWebBookDefSources(ctx));

    router.post('/', (ctx) => ctx.body="TODO: ");
    router.post('/chapter/autosync', (ctx) => ctx.body="TODO: ");
    router.post('/chapter/addnewsource', (ctx) => ctx.body="TODO: ");
    router.post('/chapter/singlechapter', (ctx) => ctx.body="TODO: ");
    
    router.patch('/chapter/mergeindex', (ctx) => ctx.body="TODO: ");
    router.patch('/chapter/updatechapter', (ctx) => ctx.body="TODO: ");
    
    router.delete('/', (ctx) => bookController.deleteBook(ctx));
    return router;
}