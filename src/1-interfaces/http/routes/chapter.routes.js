import { ChapterController } from "../controllers/ChapterController.js"
import Router from '@koa/router';
/**
 * 
 * @param {ChapterController} chapterController 
 * @returns 
 */
export function createChapterRoutes(chapterController) {
  const router = new Router({ prefix: '/library/book' });
  router.get('/chapter', (ctx) => chapterController.getChapterById(ctx));
  router.get('/chapter/adjacent', (ctx) => chapterController.getAdjacentChapter(ctx));

  router.post('/search', (ctx) => chapterController.searchBook(ctx));

  router.post("/volume/removechapters", (ctx) => chapterController.removeChaptersFromVolume(ctx));
  return router;
}