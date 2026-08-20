import { ChapterQueryService } from "../../../2-application/services/ChapterQueryService.js";
import { ChapterCommandService } from "../../../2-application/services/ChapterCommandService.js";
import { UserInputError } from '../../../5-shared/errors/index.js';

export class ChapterController {
    #chapterQueryService;
    #chapterCommandService;

    /**
     * @param {ChapterQueryService} chapterQueryService 
     * @param {ChapterCommandService} chapterCommandService 
     */
    constructor(chapterQueryService, chapterCommandService) {
        this.#chapterQueryService = chapterQueryService;
        this.#chapterCommandService = chapterCommandService;
    }

    /**
     * @swagger
     * /library/book/chapter:
     *   get:
     *     summary: 【章】根据章节ID获取章节正文
     *     description: 根据章节 ID（目录项 ID）返回章节内容及其所属图书信息（统一包装格式）
     *     tags:
     *       - Library —— 图书馆
     *       - Chapter
     *     parameters:
     *       - $ref: '#/components/parameters/ChapterIdQuery'
     *     responses:
     *       200:
     *         description: 成功返回章节详情
     *         content:
     *           application/json:
     *             schema:
     *               $ref: '#/components/schemas/ChapterDetailResponse'
     *             examples:
     *               success:
     *                 $ref: '#/components/examples/ChapterDetailSuccess'
     *       400:
     *         description: 请求参数错误（如 chapterid 非数字或小于 1）
     *         content:
     *           application/json:
     *             schema:
     *               $ref: '#/components/schemas/ApiErrorResponse'
     *             example:
     *               code: 60000
     *               msg: "提供的章节ID不正确。"
     *               timestamp: "2026-08-15T10:00:00.000Z"
     *       404:
     *         description: 章节不存在
     *         content:
     *           application/json:
     *             schema:
     *               $ref: '#/components/schemas/ApiErrorResponse'
     *             examples:
     *               notFound:
     *                 $ref: '#/components/examples/ChapterDetailNotFound'
     *       500:
     *         description: 服务器内部错误
     */
    async getChapterById(ctx) {
        const cpId = ctx.query.chapterid * 1;
        if (isNaN(cpId)) throw new UserInputError("提供的章节ID不正确。");
        ctx.body = await this.#chapterQueryService.getChapterById(cpId);
    }

    /**
     * @swagger
     * /library/book/chapter/adjacent:
     *   get:
     *     summary: 【章】拿到相邻章节的信息
     *     description: 根据章节 ID 获取上一章和下一章的 ID，若不存在则为 null（统一包装格式）
     *     tags:
     *       - Library —— 图书馆
     *       - Chapter
     *     parameters:
     *       - $ref: '#/components/parameters/ChapterIdQuery'
     *     responses:
     *       200:
     *         description: 成功返回相邻章节 ID
     *         content:
     *           application/json:
     *             schema:
     *               $ref: '#/components/schemas/ChapterAdjacentResponse'
     *             examples:
     *               both:
     *                 $ref: '#/components/examples/ChapterAdjacentSuccess'
     *               onlyNext:
     *                 $ref: '#/components/examples/ChapterAdjacentOnlyNext'
     *               onlyPre:
     *                 $ref: '#/components/examples/ChapterAdjacentOnlyPre'
     *       400:
     *         description: 请求参数错误（如 chapterid 非数字或小于 1）
     *         content:
     *           application/json:
     *             schema:
     *               $ref: '#/components/schemas/ApiErrorResponse'
     *             example:
     *               code: 60000
     *               msg: "提供的章节ID不正确。"
     *               timestamp: "2026-08-15T10:00:00.000Z"
     *       404:
     *         description: 章节不存在
     *         content:
     *           application/json:
     *             schema:
     *               $ref: '#/components/schemas/ApiErrorResponse'
     *             examples:
     *               notFound:
     *                 $ref: '#/components/examples/ChapterAdjacentNotFound'
     *       500:
     *         description: 服务器内部错误
     */
    async getAdjacentChapter(ctx) {
        const chapterId = ctx.query.chapterid * 1;
        if (isNaN(chapterId)) throw new UserInputError("提供的章节ID不正确。");
        ctx.body = await this.#chapterQueryService.getAdjacentChapter(chapterId);
    }


    /**
     * @swagger
     * /library/book/search:
     *   post:
     *     summary: 搜索图书章节
     *     description: 根据关键词和选项搜索章节内容或标题，返回匹配的章节列表（统一包装格式）
     *     tags:
     *       - Library —— 图书馆
     *       - Chapter
     *     requestBody:
     *       required: true
     *       content:
     *         application/json:
     *           schema:
     *             $ref: '#/components/schemas/BookSearchRequest'
     *           examples:
     *             withOptions:
     *               $ref: '#/components/examples/BookSearchRequestExample'
     *             minimal:
     *               $ref: '#/components/examples/BookSearchRequestMinimal'
     *     responses:
     *       200:
     *         description: 搜索成功，返回结果列表
     *         content:
     *           application/json:
     *             schema:
     *               $ref: '#/components/schemas/BookSearchResponse'
     *             examples:
     *               success:
     *                 $ref: '#/components/examples/BookSearchSuccess'
     *               empty:
     *                 $ref: '#/components/examples/BookSearchEmpty'
     *       600:
     *         description: 请求参数错误（如 keyword 缺失、option 格式错误）
     *         content:
     *           application/json:
     *             schema:
     *               $ref: '#/components/schemas/ApiErrorResponse'
     *             example:
     *               code: 40000
     *               msg: "必须输入查询关键字"
     *               timestamp: "2026-08-19T15:00:00.000Z"
     *       500:
     *         description: 服务器内部错误
     */
    async searchBook(ctx) {
        const { keyword, option } = ctx.request.body;
        if (!keyword) throw new UserInputError("必须输入查询关键字");
        ctx.body = await this.#chapterQueryService.searchChapters(keyword, option);
    }

    /**
     * @swagger
     * /library/book/volume/removechapters:
     *   post:
     *     summary: 【卷】从卷中删除章节
     *     description: 根据章节 ID 列表批量从卷中删除章节，返回删除的行数（统一包装格式）
     *     tags:
     *       - Library —— 图书馆
     *       - Chapter
     *     requestBody:
     *       required: true
     *       content:
     *         application/json:
     *           schema:
     *             $ref: '#/components/schemas/RemoveChaptersRequest'
     *           example:
     *             chapterIds: [1, 3, 4]
     *     responses:
     *       200:
     *         description: 删除成功，返回删除的行数
     *         content:
     *           application/json:
     *             schema:
     *               allOf:
     *                 - $ref: '#/components/schemas/ApiResponse'
     *                 - type: object
     *                   properties:
     *                     data:
     *                       type: integer
     *                       description: 实际从卷中删除的章节行数
     *                       example: 3
     *             example:
     *               code: 20000
     *               msg: "success"
     *               timestamp: "2026-08-21T10:00:00.000Z"
     *               data: 3
     *       400:
     *         description: 请求参数错误（如 chapterIds 缺失或非数字数组）
     *         content:
     *           application/json:
     *             schema:
     *               $ref: '#/components/schemas/ApiErrorResponse'
     *             example:
     *               code: 40000
     *               msg: "chapterIds 必须为整数数组"
     *               timestamp: "2026-08-21T10:00:00.000Z"
     *       500:
     *         description: 服务器内部错误
     */
    async removeChaptersFromVolume(ctx) {
        const { chapterIds } = ctx.request.body;
        if (!Array.isArray(chapterIds)) throw new UserInputError("提供的章节格式不对");
        ctx.body = await this.#chapterCommandService.removeChaptersFromVolume(chapterIds);

    }
}
