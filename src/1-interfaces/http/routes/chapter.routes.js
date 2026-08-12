import Router from '@koa/router';
import { ChapterController } from "../controllers/ChapterController.js"
/**
 * 
 * @param {ChapterController} chapterController 
 * @returns 
 */
export function createChapterRoutes(chapterController) {
  const router = new Router({ prefix: '/library/book/chapter' });
  router.get('/', (ctx) => chapterController.getChapterById(ctx));
  router.get('/adjacent', (ctx) => chapterController.getAdjacentChapter(ctx));

  return router;
}