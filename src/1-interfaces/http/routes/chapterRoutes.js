import Router from '@koa/router';
import { ChapterController } from "../controllers/ChapterController.js"
/**
 * 
 * @param {ChapterController} chapterController 
 * @returns 
 */
export function createChapterRoutes(chapterController) {
  const router = new Router({ prefix: '/library' });
  router.get('/book/chapter', (ctx) => chapterController.getChapterById(ctx));

  return router;
}
