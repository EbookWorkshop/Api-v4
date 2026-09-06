import { UserInputError } from '../../../5-shared/errors/index.js';
import { BookIdRequest } from "../dtos/components/BookIdRequest.dto.js";
import { ChapterRequest } from "../dtos/components/Chapter.dto.js"

export class ReviewBookController {
    #reviewBookService;

    constructor(reviewBookService) {
        this.#reviewBookService = reviewBookService;
    }

    /**
     * @swagger
     * /review/book/try:
     *   post:
     *     summary: 预览审核替换效果
     *     description: 对指定章节应用正则替换并返回预览结果（不实际保存）
     *     tags:
     *       - Review - Rule —— 自助校阅 - 规则库
     *       - Review
     *     requestBody:
     *       required: true
     *       content:
     *         application/json:
     *           schema:
     *             $ref: '#/components/schemas/TryReviewRequest'
     *           examples:
     *             default:
     *               $ref: '#/components/examples/TryReviewRequestExample'
     *     responses:
     *       200:
     *         description: 预览成功（返回替换后的内容或差异）
     *         content:
     *           application/json:
     *             schema:
     *               $ref: '#/components/schemas/ApiSuccessResponse'
     *             example:
     *               code: 20000
     *               msg: "success"
     *               timestamp: "2026-09-07T10:00:00.000Z"
     *               data: { changes: [...] }
     *       400:
     *         description: 请求参数错误
     *         content:
     *           application/json:
     *             schema:
     *               $ref: '#/components/schemas/ApiErrorResponse'
     *             example:
     *               code: 60000
     *               msg: "chapterIds, regex, replace 均为必填字段"
     *               timestamp: "2026-09-07T10:00:00.000Z"
     *       500:
     *         description: 服务器内部错误
     */
    async tryReview(ctx) {
        const { bookId, chapterIds, regex, replace } = ctx.request.body;
        if (!bookId || !chapterIds?.length || !regex) {
            throw new UserInputError('chapterIds 和 regex 为必填');
        }
        const result = await this.#reviewBookService.preview(bookId, chapterIds, regex, replace || '');
        ctx.body = result;
    }

    /**
     * @swagger
     * /review/book/save:
     *   post:
     *     summary: 保存审核替换
     *     description: 对指定图书的章节应用正则替换并永久保存更改
     *     tags:
     *       - Review - Rule —— 自助校阅 - 规则库
     *       - Review
     *     requestBody:
     *       required: true
     *       content:
     *         application/json:
     *           schema:
     *             $ref: '#/components/schemas/SaveReviewRequest'
     *           examples:
     *             default:
     *               $ref: '#/components/examples/SaveReviewRequestExample'
     *     responses:
     *       200:
     *         description: 保存成功
     *         content:
     *           application/json:
     *             schema:
     *               $ref: '#/components/schemas/ApiSuccessResponse'
     *             example:
     *               code: 20000
     *               msg: "success"
     *               timestamp: "2026-09-07T10:00:00.000Z"
     *       400:
     *         description: 请求参数错误
     *         content:
     *           application/json:
     *             schema:
     *               $ref: '#/components/schemas/ApiErrorResponse'
     *             example:
     *               code: 60000
     *               msg: "bookId, regex, replace, chapterIds 均为必填字段"
     *               timestamp: "2026-09-07T10:00:00.000Z"
     *       404:
     *         description: 图书或章节不存在
     *         content:
     *           application/json:
     *             schema:
     *               $ref: '#/components/schemas/ApiErrorResponse'
     *             example:
     *               code: 40400
     *               msg: "未找到该图书或指定章节"
     *               timestamp: "2026-09-07T10:00:00.000Z"
     *       500:
     *         description: 服务器内部错误
     */
    async saveReview(ctx) {
        const { bookId, regex, replace, chapterIds } = ctx.request.body;
        if (!bookId || !regex) {
            throw new UserInputError('bookId 和 regex 为必填');
        }
        const result = await this.#reviewBookService.save(bookId, regex, replace || '', chapterIds);
        ctx.body = result;
    }

    /**
     * @swagger
     * /review/book/suspiciouschars:
     *   get:
     *     summary: 获取可疑字符
     *     description: 检查指定图书的某些章节中是否存在可疑字符（如非常规Unicode）
     *     tags:
     *       - Review - Rule —— 自助校阅 - 规则库
     *       - Review
     *     parameters:
     *       - $ref: '#/components/parameters/BookIdQuery'
     *       - $ref: '#/components/parameters/ChapterIdsQuery'
     *     responses:
     *       200:
     *         description: 返回可疑字符列表
     *         content:
     *           application/json:
     *             schema:
     *               allOf:
     *                 - $ref: '#/components/schemas/ApiResponse'
     *                 - type: object
     *                   properties:
     *                     data:
     *                       type: array
     *                       items:
     *                         type: string
     *                       description: 可疑字符列表
     *             example:
     *               code: 20000
     *               msg: "success"
     *               timestamp: "2026-09-07T10:00:00.000Z"
     *               data: ["\uFFFD", "\u200B"]
     *       400:
     *         description: 参数错误（bookid 或 chapterid 缺失或无效）
     *         content:
     *           application/json:
     *             schema:
     *               $ref: '#/components/schemas/ApiErrorResponse'
     *             example:
     *               code: 60000
     *               msg: "bookid 和 chapterids 为必填参数"
     *               timestamp: "2026-09-07T10:00:00.000Z"
     *       500:
     *         description: 服务器内部错误
     */
    async analyzeSuspiciousChars(ctx) {
        const bookId = BookIdRequest.fromQuery(ctx.query);
        const chapIds = ChapterRequest.fromQueryIds(ctx.query);

        const result = await this.#reviewBookService.analyzeSuspiciousChars(bookId, chapIds);
        ctx.body = result;
    }
}