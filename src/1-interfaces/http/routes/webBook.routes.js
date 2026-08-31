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

    router.post('/', (ctx) => bookController.createWebBook(ctx));
    router.post('/singlechapter', (ctx) => bookController.collectSingleChapter(ctx));
    router.post('/chapter/autosync', (ctx) => ctx.body = "TODO: /chapter/autosync");
    router.post('/chapter/addnewsource', (ctx) => ctx.body = "TODO: /chapter/addnewsource");

    router.patch('/chapter/mergeindex', (ctx) => ctx.body = "TODO: /chapter/mergeindex");
    router.patch('/chapter/updatechapter', (ctx) => ctx.body = "TODO: /chapter/updatechapter");

    router.delete('/', (ctx) => bookController.deleteBook(ctx));
    return router;
}