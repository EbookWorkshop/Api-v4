import { TagQueryService } from "../../../2-application/services/TagQueryService.js";
import { UserInputError } from "../../../5-shared/errors/index.js";

export class TagController {
    #TagQueryService;
    #TagCommandService;

    /**
     * 
     * @param {TagQueryService} TagQueryService 
     * @param {TagCommandService} TagCommandService 
     */
    constructor(TagQueryService, TagCommandService) {
        this.#TagQueryService = TagQueryService;
        this.#TagCommandService = TagCommandService;
    }

    /**
     * @swagger
     * /library/tag/list:
     *   get:
     *     summary: 获取标签列表
     *     description: 支持按是否有图书进行筛选，返回所有标签或仅包含图书的标签列表
     *     tags:
     *       - Library - Tag —— 图书馆管理
     *       - Tag
     *     parameters:
     *       - $ref: '#/components/parameters/HasBookQuery'
     *     responses:
     *       200:
     *         description: 成功返回标签列表
     *         content:
     *           application/json:
     *             schema:
     *               $ref: '#/components/schemas/TagListResponse'
     *             examples:
     *               success:
     *                 $ref: '#/components/examples/TagListSuccess'
     *               empty:
     *                 $ref: '#/components/examples/TagListEmpty'
     *       500:
     *         description: 服务器内部错误
     *         content:
     *           application/json:
     *             schema:
     *               $ref: '#/components/schemas/ApiErrorResponse'
     *             example:
     *               code: 50000
     */
    async listTags(ctx) {
        const hasbook = ctx.query.hasbook * 1 > 0
        ctx.body = await this.#TagQueryService.getTagList(hasbook);
    }

    /**
     * @swagger
     * /library/ebooktag:
     *   get:
     *     summary: 获取某本书的电子标签列表
     *     description: 根据图书 ID 查询该图书关联的所有标签（统一包装格式）
     *     tags:
     *       - Library - Tag —— 图书馆管理
     *       - Tag
     *     parameters:
     *       - $ref: '#/components/parameters/BookIdQuery'
     *     responses:
     *       200:
     *         description: 成功返回标签列表
     *         content:
     *           application/json:
     *             schema:
     *               $ref: '#/components/schemas/TagListResponse'
     *             examples:
     *               success:
     *                 $ref: '#/components/examples/TagListSuccess'
     *               empty:
     *                 $ref: '#/components/examples/TagListEmpty'
     *       500:
     *         description: 服务器内部错误
     *         content:
     *           application/json:
     *             schema:
     *               $ref: '#/components/schemas/ApiErrorResponse'
     *             example:
     *               code: 50000
     *       600:
     *         description: 请求参数错误（如 bookid 非数字或小于 1）
     *         content:
     *           application/json:
     *             schema:
     *               $ref: '#/components/schemas/ApiErrorResponse'
     *             example:
     *               code: 60000
     *               msg: "提供的书籍ID不正确。"
     */
    async ebookTags(ctx) {
        const bookId = ctx.query.bookid * 1;
        if (isNaN(bookId)) throw new UserInputError("提供的书籍ID不正确。");
        ctx.body = await this.#TagQueryService.getEbookTags(bookId);
    }

    /**
     * @swagger
     * /library/tag:
     *   post:
     *     summary: 创建新标签
     *     description: 创建新的图书标签，可选的关联图书或颜色（统一包装格式）
     *     tags:
     *       - Library - Tag —— 图书馆管理
     *       - Tag
     *     requestBody:
     *       required: true
     *       content:
     *         application/json:
     *           schema:
     *             $ref: '#/components/schemas/TagCreateRequest'
     *           examples:
     *             full:
     *               $ref: '#/components/examples/TagCreateRequestExample'
     *             minimal:
     *               $ref: '#/components/examples/TagCreateRequestMinimal'
     *     responses:
     *       200:
     *         description: 标签创建成功
     *         content:
     *           application/json:
     *             schema:
     *               $ref: '#/components/schemas/ApiResponse'
     *             examples:
     *               success:
     *                 $ref: '#/components/examples/CreateTagSuccess'
     *       400:
     *         description: 请求参数错误（如 tagText 缺失、bookId 非数字）
     *         content:
     *           application/json:
     *             schema:
     *               $ref: '#/components/schemas/ApiErrorResponse'
     *             example:
     *               code: 40000
     *               msg: "tagText 为必填字段"
     *               timestamp: "2026-08-20T16:00:00.000Z"
     *       500:
     *         description: 服务器内部错误
     */
    async createTag(ctx) {
        const { bookId, tagText, color } = ctx.request.body;
        if (!tagText) throw AppError("标签不能为空", 600);
        ctx.body = await this.#TagCommandService.createTag(tagText.trim(), color, bookId);
    }

    /**
     * @swagger
     * /library/tag:
     *   delete:
     *     summary: 删除标签
     *     description: 根据标签 ID 删除指定的标签（统一包装格式）
     *     tags:
     *       - Library - Tag —— 图书馆管理
     *       - Tag
     *     parameters:
     *       - in: query
     *         name: tagid
     *         schema:
     *           type: integer
     *           minimum: 1
     *         required: true
     *         description: 要删除的标签 ID
     *         example: 1
     *     responses:
     *       200:
     *         description: 删除成功，并返回删除数量
     *         content:
     *           application/json:
     *             schema:
     *               $ref: '#/components/schemas/ApiResponse'
     *             example:
     *               code: 20000
     *               data: 1
     *               msg: "success"
     *               timestamp: "2026-08-20T17:00:00.000Z"
     *       600:
     *         description: 参数错误（如 tagid 缺失或非数字）
     *         content:
     *           application/json:
     *             schema:
     *               $ref: '#/components/schemas/ApiErrorResponse'
     *             example:
     *               code: 40000
     *               msg: "tagid 必须为有效整数"
     *               timestamp: "2026-08-20T17:00:00.000Z"
     *       404:
     *         description: 标签不存在
     *         content:
     *           application/json:
     *             schema:
     *               $ref: '#/components/schemas/ApiErrorResponse'
     *             example:
     *               code: 40400
     *               msg: "未找到该标签"
     *               timestamp: "2026-08-20T17:00:00.000Z"
     *       500:
     *         description: 服务器内部错误
     */
    async deleteTag(ctx) {
        const tagId = ctx.query.tagid * 1;
        if (isNaN(tagId)) throw new AppError("tagid 必须为有效整数", 400);
        const result = await this.#TagCommandService.deleteTag(tagId);
        ctx.body = result;
    }

    /**
     * @swagger
     * /library/tag:
     *   put:
     *     summary: 更新标签
     *     description: 根据标签 ID 更新标签的文本或颜色（统一包装格式）
     *     tags:
     *       - Library - Tag —— 图书馆管理
     *       - Tag
     *     requestBody:
     *       required: true
     *       content:
     *         application/json:
     *           schema:
     *             $ref: '#/components/schemas/UpdateTagRequest'
     *           examples:
     *             full:
     *               $ref: '#/components/examples/UpdateTagRequestExample'
     *             partial:
     *               $ref: '#/components/examples/UpdateTagRequestPartial'
     *     responses:
     *       200:
     *         description: 标签更新成功，返回更新行数
     *         content:
     *           application/json:
     *             schema:
     *               $ref: '#/components/schemas/ApiResponse'
     *             example:
     *               code: 20000
     *               data: 1
     *               msg: "success"
     *               timestamp: "2026-08-20T18:00:00.000Z"
     *       600:
     *         description: 请求参数错误（如 tagId 缺失或非数字）
     *         content:
     *           application/json:
     *             schema:
     *               $ref: '#/components/schemas/ApiErrorResponse'
     *             example:
     *               code: 40000
     *               msg: "tagId 为必填字段且必须为有效整数"
     *               timestamp: "2026-08-20T18:00:00.000Z"
     *       404:
     *         description: 标签不存在
     *         content:
     *           application/json:
     *             schema:
     *               $ref: '#/components/schemas/ApiErrorResponse'
     *             example:
     *               code: 40400
     *               msg: "未找到该标签"
     *               timestamp: "2026-08-20T18:00:00.000Z"
     *       500:
     *         description: 服务器内部错误
     */
    async updateTag(ctx) {
        const { tagId, tagText, color } = ctx.request.body;
        if (isNaN(tagId)) throw new AppError("tagid 必须为有效整数", 600);
        ctx.body = await this.#TagCommandService.updateTag(tagId, tagText, color);
    }

    /**
     * @swagger
     * /library/tagonbook:
     *   delete:
     *     summary: 从图书移除标签
     *     description: 解除图书与标签的关联关系（统一包装格式）
     *     tags:
     *       - Library - Tag —— 图书馆管理
     *       - Tag
     *     parameters:
     *       - $ref: '#/components/parameters/BookIdQuery'
     *       - in: query
     *         name: tagid
     *         schema:
     *           type: integer
     *           minimum: 1
     *         required: true
     *         description: 标签 ID
     *         example: 1
     *     responses:
     *       200:
     *         description: 移除成功
     *         content:
     *           application/json:
     *             schema:
     *               $ref: '#/components/schemas/ApiResponse'
     *             example:
     *               code: 20000
     *               msg: "success"
     *               timestamp: "2026-08-20T19:00:00.000Z"
     *       400:
     *         description: 参数错误（如 bookid 或 tagid 缺失或非数字）
     *         content:
     *           application/json:
     *             schema:
     *               $ref: '#/components/schemas/ApiErrorResponse'
     *             example:
     *               code: 40000
     *               msg: "bookid 和 tagid 必须为有效整数"
     *               timestamp: "2026-08-20T19:00:00.000Z"
     *       404:
     *         description: 图书或标签不存在，或关联不存在
     *         content:
     *           application/json:
     *             schema:
     *               $ref: '#/components/schemas/ApiErrorResponse'
     *             example:
     *               code: 40400
     *               msg: "未找到该关联关系"
     *               timestamp: "2026-08-20T19:00:00.000Z"
     *       500:
     *         description: 服务器内部错误
     */
    async removeTagFromBook(ctx) {
        const bookId = ctx.query.bookid * 1;
        const tagId = ctx.query.tagid * 1;
        if (isNaN(bookId) || isNaN(tagId)) {
            throw new UserInputError("bookid 和 tagid 必须为有效整数");
        }
        ctx.body = await this.#TagCommandService.removeTagFromBook(bookId, tagId);
    }
}
