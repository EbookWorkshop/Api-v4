
import { BookmarkService } from "../../../2-application/services/BookmarkService.js";
import { ChapterRequest } from "../dtos/components/Chapter.dto.js";
import { IdRequest } from "../dtos/components/IdRequest.dto.js";
import { AppError, UserInputError } from '../../../5-shared/errors/index.js';

export class BookmarkController {
    #bookmarkService;
    /**
     * @param {BookmarkService} bookmarkService 
     */
    constructor(bookmarkService) {
        this.#bookmarkService = bookmarkService;
    }

    /**
     * @swagger
     * /library/bookmark:
     *   get:
     *     summary: 获取书签列表
     *     description: 返回当前用户（或系统）的所有书签，若提供 `bookid` 则仅返回该图书下的书签（统一包装格式）
     *     tags:
     *       - Library - Bookmark —— 图书馆书签
     *       - Bookmark
     *     parameters:
     *       - in: query
     *         name: bookid
     *         schema:
     *           type: integer
     *           minimum: 1
     *         required: false
     *         description: 可选，指定图书ID，只返回该图书的书签
     *         example: 209
     *     responses:
     *       200:
     *         description: 成功返回书签列表
     *         content:
     *           application/json:
     *             schema:
     *               $ref: '#/components/schemas/BookmarkListResponse'
     *             examples:
     *               success:
     *                 $ref: '#/components/examples/BookmarkListSuccess'
     *               empty:
     *                 $ref: '#/components/examples/BookmarkListEmpty'
     *       500:
     *         description: 服务器内部错误
     *         content:
     *           application/json:
     *             schema:
     *               $ref: '#/components/schemas/ApiErrorResponse'
     *             example:
     *               code: 50000
     *               msg: "服务器内部错误"
     *               timestamp: "2026-08-29T10:00:00.000Z"
     *       600:
     *         description: 参数错误（如 bookid 非数字）
     *         content:
     *           application/json:
     *             schema:
     *               $ref: '#/components/schemas/ApiErrorResponse'
     *             example:
     *               code: 60000
     *               msg: "bookid 必须为有效整数"
     *               timestamp: "2026-08-29T10:00:00.000Z"
     */
    async listBookmarks(ctx) {
        const bookid = ctx.query.bookid * 1;
        ctx.body = await this.#bookmarkService.listBookmarks(bookid);
    }

    /**
     * @swagger
     * /library/bookmark:
     *   post:
     *     summary: 添加书签
     *     description: 为指定章节添加书签（统一包装格式）
     *     tags:
     *       - Library - Bookmark —— 图书馆书签
     *       - Bookmark
     *     requestBody:
     *       required: true
     *       content:
     *         application/json:
     *           schema:
     *             $ref: '#/components/schemas/ChapterIdRequest'
     *           example:
     *             chapterId: 3403
     *     responses:
     *       200:
     *         description: 添加成功
     *         content:
     *           application/json:
     *             schema:
     *               $ref: '#/components/schemas/ApiSuccessResponse'
     *             example:
     *               code: 20000
     *               msg: "success"
     *               timestamp: "2026-08-29T10:00:00.000Z"
     *               data: true
     *       404:
     *         description: 章节不存在
     *         content:
     *           application/json:
     *             schema:
     *               $ref: '#/components/schemas/ApiErrorResponse'
     *             example:
     *               code: 40400
     *               msg: "未找到该章节"
     *               timestamp: "2026-08-29T10:00:00.000Z"
     *       500:
     *         description: 服务器内部错误
     *         content:
     *           application/json:
     *             schema:
     *               $ref: '#/components/schemas/ApiErrorResponse'
     *             example:
     *               code: 50000
     *               msg: "服务器内部错误"
     *               timestamp: "2026-08-29T10:00:00.000Z"
     *       600:
     *         description: 请求参数错误（如 chapterId 缺失或非数字）
     *         content:
     *           application/json:
     *             schema:
     *               $ref: '#/components/schemas/ApiErrorResponse'
     *             example:
     *               code: 60000
     *               msg: "chapterId 必须为有效整数"
     *               timestamp: "2026-08-29T10:00:00.000Z"
     */
    async addBookmark(ctx) {
        const chapterId = ChapterRequest.fromBodyId(ctx.request.body);
        ctx.body = await this.#bookmarkService.addBookmark(chapterId);
    }

    /**
     * @swagger
     * /library/bookmark:
     *   delete:
     *     summary: 删除书签
     *     description: 根据书签ID删除指定的书签（统一包装格式）
     *     tags:
     *       - Library - Bookmark —— 图书馆书签
     *       - Bookmark
     *     parameters:
     *       - $ref: '#/components/parameters/IdRequest'
     *     responses:
     *       200:
     *         description: 删除成功
     *         content:
     *           application/json:
     *             schema:
     *               $ref: '#/components/schemas/ApiSuccessResponse'
     *             examples:
     *               success:
     *                 value:
     *                   code: 20000
     *                   msg: "success"
     *                   timestamp: "2026-08-29T10:00:00.000Z"
     *                   data: 1
     *       404:
     *         description: 书签不存在
     *         content:
     *           application/json:
     *             schema:
     *               $ref: '#/components/schemas/ApiErrorResponse'
     *             example:
     *               code: 40400
     *               msg: "未找到该书签"
     *               timestamp: "2026-08-29T10:00:00.000Z"
     *       500:
     *         description: 服务器内部错误
     *         content:
     *           application/json:
     *             schema:
     *               $ref: '#/components/schemas/ApiErrorResponse'
     *             example:
     *               code: 50000
     *               msg: "服务器内部错误"
     *               timestamp: "2026-08-29T10:00:00.000Z"
     *       600:
     *         description: 参数错误（如 id 缺失或非数字）
     *         content:
     *           application/json:
     *             schema:
     *               $ref: '#/components/schemas/ApiErrorResponse'
     *             example:
     *               code: 60000
     *               msg: "id 必须为有效整数"
     *               timestamp: "2026-08-29T10:00:00.000Z"
     */
    async deleteBookmark(ctx) {
        const id = IdRequest.fromQuery(ctx.query);
        ctx.body = await this.#bookmarkService.deleteBookmark(id);
    }
}