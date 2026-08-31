
import { WebBookChapterURLService } from "../../../2-application/services/WebBookChapterURLService.js";
import { ChapterRequest } from "../dtos/components/Chapter.dto.js";

export class WebBookChapterURLController {
    #webBookChapterURLService;
    /**
     * @param {WebBookChapterURLService} webBookChapterURLService 
     */
    constructor(webBookChapterURLService) {
        this.#webBookChapterURLService = webBookChapterURLService;
    }

    /**
     * @swagger
     * /library/webbook/chapter/sources:
     *   get:
     *     summary: 获取网页图书章节的源列表
     *     description: 返回所有或指定图书的章节源（如有参数可扩展，此处为无参数版本）（统一包装格式）
     *     tags:
     *       - Library - WebBook —— 网文图书馆
     *       - WebBook
     *     parameters:
     *       - $ref: '#/components/parameters/ChapterIdQuery'
     *     responses:
     *       200:
     *         description: 成功返回源列表
     *         content:
     *           application/json:
     *             schema:
     *               $ref: '#/components/schemas/WebBookChapterSourceListResponse'
     *             examples:
     *               success:
     *                 $ref: '#/components/examples/WebBookChapterSourceListSuccess'
     *               empty:
     *                 $ref: '#/components/examples/ResultListEmpty'
     *       500:
     *         description: 服务器内部错误
     */
    async getWebBookChapterSources(ctx) {
        const chapterId = ChapterRequest.fromQueryId(ctx.query);
        ctx.body = await this.#webBookChapterURLService.getChapterSources(chapterId);
    }
}