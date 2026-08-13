import { TagQueryService } from "../../../2-application/services/TagQueryService.js";
import { AppError } from "../../../5-shared/errors/AppError.js";

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
        if (isNaN(bookId)) throw new AppError("提供的书籍ID不正确。", 600);
        ctx.body = await this.#TagQueryService.getEbookTags(bookId);
    }
}
