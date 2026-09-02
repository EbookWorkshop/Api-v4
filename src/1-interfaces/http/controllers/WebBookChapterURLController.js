
import { WebBookChapterURLService } from "../../../2-application/services/WebBookChapterURLService.js";
import { BookIdRequest } from "../dtos/components/BookIdRequest.dto.js";
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
     *     summary: 获取网文章节的源列表
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

    /**
     * @swagger
     * /library/webbook/chapter/source/default:
     *   get:
     *     summary: 获取默认章节源 URL
     *     description: 根据章节 ID 或图书 ID 获取对应的默认章节源地址。`chapterid`必须提供。（统一包装格式）
     *     tags:
     *       - Library - WebBook —— 网文图书馆
     *       - WebBook
     *     parameters:
     *       - $ref: '#/components/parameters/ChapterIdQuery'
     *       - $ref: '#/components/parameters/BookIdQuery'
     *     responses:
     *       200:
     *         description: 成功返回默认源 URL
     *         content:
     *           application/json:
     *             schema:
     *               $ref: '#/components/schemas/DefaultChapterSourceResponse'
     *             example:
     *               code: 20000
     *               msg: "success"
     *               timestamp: "2026-09-02T10:00:00.000Z"
     *               data: "https://aaa.bb.com/page/to/show/"
     *       400:
     *         description: 参数错误（chapterId 和 bookId 均未提供或无效）
     *         content:
     *           application/json:
     *             schema:
     *               $ref: '#/components/schemas/ApiErrorResponse'
     *             example:
     *               code: 60000
     *               msg: "请提供 chapterId 或 bookId"
     *               timestamp: "2026-09-02T10:00:00.000Z"
     *       404:
     *         description: 未找到对应的默认源
     *         content:
     *           application/json:
     *             schema:
     *               $ref: '#/components/schemas/ApiErrorResponse'
     *             example:
     *               code: 40400
     *               msg: "未找到默认章节源"
     *               timestamp: "2026-09-02T10:00:00.000Z"
     *       500:
     *         description: 服务器内部错误
     */
    async getDefaultChapterSource(ctx) {
        const chapterId = ChapterRequest.fromQueryId(ctx.query);
        const bookId = BookIdRequest.fromQuery(ctx.query);
        const result = await this.#webBookChapterURLService.getDefaultChapterSource(chapterId, bookId);
        ctx.body = result;
    }

    /**
     * @swagger
     * /library/webbook/chapter/sources:
     *   post:
     *     summary: 更新网文章节源
     *     description: 更新已有源的 URL
     *     tags:
     *       - Library - WebBook —— 网文图书馆
     *       - WebBook
     *     requestBody:
     *       required: true
     *       content:
     *         application/json:
     *           schema:
     *             $ref: '#/components/schemas/UpsertWebBookChapterSourceRequest'
     *           examples:
     *             create:
     *               $ref: '#/components/examples/UpsertWebBookChapterSourceRequestExample'
     *             update:
     *               $ref: '#/components/examples/UpsertWebBookChapterSourceUpdateExample'
     *     responses:
     *       200:
     *         description: 操作成功
     *         content:
     *           application/json:
     *             schema:
     *               $ref: '#/components/schemas/ApiSuccessResponse'
     *             example:
     *               code: 20000
     *               msg: "success"
     *               timestamp: "2026-09-01T14:00:00.000Z"
     *       400:
     *         description: 请求参数错误（如 url 缺失或格式不正确）
     *         content:
     *           application/json:
     *             schema:
     *               $ref: '#/components/schemas/ApiErrorResponse'
     *             example:
     *               code: 60000
     *               msg: "url 为必填字段且需为有效 URL"
     *               timestamp: "2026-09-01T14:00:00.000Z"
     *       404:
     *         description: 更新时指定的 id 不存在
     *         content:
     *           application/json:
     *             schema:
     *               $ref: '#/components/schemas/ApiErrorResponse'
     *             example:
     *               code: 40400
     *               msg: "未找到该章节源记录"
     *               timestamp: "2026-09-01T14:00:00.000Z"
     *       500:
     *         description: 服务器内部错误
     */
    async upsertWebBookChapterSource(ctx) {
        const { id, url } = ctx.request.body;
        const result = await this.#webBookChapterURLService.upsertChapterSource(id, url);
        ctx.body = result;
    }
}