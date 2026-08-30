import { BookmarkController } from "../controllers/BookmarkController.js"
    import Router from '@koa/router';
    
    /**
     * @param {BookmarkController} bookmarkController 
     * @returns 
     */
    export function createBookmarkRoutes(bookmarkController) {
        const router = new Router({ prefix: '/library/bookmark' });
        router.get('/', (ctx) => bookmarkController.listBookmarks(ctx));
        router.post('/', (ctx) => bookmarkController.addBookmark(ctx));
        router.delete('/', (ctx) => bookmarkController.deleteBookmark(ctx));
    
        return router;
    }