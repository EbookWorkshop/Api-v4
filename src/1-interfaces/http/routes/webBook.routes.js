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
    router.get('/chapter/sources', (ctx) => ctx.body = "TODO: /chapter/sources");
    
    router.post('/', (ctx) => bookController.createWebBook(ctx));
    router.post('/autosync', (ctx) => ctx.body = "TODO: /autosync");
    router.post('/singlechapter', (ctx) => bookController.collectSingleChapter(ctx));
    router.post('/addnewsource', (ctx) => ctx.body = "TODO: /addnewsource");
    router.post('/chapter/sources', (ctx) => ctx.body = "TODO: /chapter/sources");
    
    router.patch('/mergeindex', (ctx) => ctx.body = "TODO: /mergeindex");
    router.patch('/updatechapter', (ctx) => bookController.updateWebBookChapters(ctx));

    router.delete('/', (ctx) => bookController.deleteBook(ctx));
    return router;
}