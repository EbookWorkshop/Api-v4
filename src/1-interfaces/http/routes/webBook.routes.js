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
    router.post('/autosync', (ctx) => bookController.setAutoSync(ctx));
    router.post('/singlechapter', (ctx) => bookController.collectSingleChapter(ctx));
    router.post('/addnewsource', (ctx) => ctx.body = "TODO: /addnewsource");

    router.patch('/mergeindex', (ctx) => ctx.body = "TODO: /mergeindex");
    router.patch('/updatechapter', (ctx) => bookController.updateWebBookChapters(ctx));

    router.delete('/', (ctx) => bookController.deleteBook(ctx));
    return router;
}