import { BookmarkController } from "../controllers/BookmarkController.js"
    import Router from '@koa/router';
    
    /**
     * @param {BookmarkController} bookmarkController 
     * @returns 
     */
    export function createBookmarkRoutes(bookmarkController) {
        const router = new Router({ prefix: '/library/bookmark' });//TODO: 设置路由前缀
        router.get('/', (ctx) => bookmarkController.listBookmarks(ctx));    //设子路由与控制器之间的关联
        router.post('/', (ctx) => bookmarkController.addBookmark(ctx));    //设子路由与控制器之间的关联
        router.delete('/', (ctx) => bookmarkController.deleteBookmark(ctx));    //设子路由与控制器之间的关联
    
        return router;
    }