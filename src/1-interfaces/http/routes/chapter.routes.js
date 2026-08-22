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
  router.get('/chapter/listhidden', (ctx) => chapterController.listHiddenChapters(ctx));

  router.post('/chapter', (ctx) => chapterController.upsertChapter(ctx));
  router.post('/chapter/tointroduction', (ctx) => chapterController.setChapterAsIntroduction(ctx));

  router.post('/search', (ctx) => chapterController.searchBook(ctx));
  router.post("/volume/removechapters", (ctx) => chapterController.removeChaptersFromVolume(ctx));

  router.patch('/chapter', (ctx) => chapterController.batchInsertChapters(ctx));
  router.patch('/chapter/order', (ctx) => chapterController.updateChapterOrder(ctx));
  router.patch('/chapter/toggleHide', (ctx) => chapterController.toggleHide(ctx));

  router.delete('/chapter', (ctx) => chapterController.deleteChapter(ctx));

  return router;
}