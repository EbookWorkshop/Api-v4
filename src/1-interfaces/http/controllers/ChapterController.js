import { ChapterQueryService } from "../../../2-application/services/ChapterQueryService.js";

export class ChapterController {
    #chapterQueryService;

    /**
     * 
     * @param {ChapterQueryService} chapterQueryService 
     */
    constructor(chapterQueryService) {
        this.#chapterQueryService = chapterQueryService;
    }

    /**
     * 获取具体章节信息
     * @param {*} ctx 
     */
    async getChapterById(ctx) {
        const cpId = ctx.query.chapterid * 1;
        ctx.body = await this.#chapterQueryService.getChapterById(cpId);
    }

}
