
import { ReviewRuleUsingService } from "../../../2-application/services/ReviewRuleUsingService.js";
import { BookIdRequest } from "../dtos/components/BookIdRequest.dto.js";
import { IdRequest } from "../dtos/components/IdRequest.dto.js";

export class ReviewRuleUsingController {
    #reviewRuleUsingService;
    /**
     * @param {ReviewRuleUsingService} reviewRuleUsingService 
     */
    constructor(reviewRuleUsingService) {
        this.#reviewRuleUsingService = reviewRuleUsingService;
    }

    /**
     * @swagger
     * /review/bookwithrule/list:
     *   get:
     *     summary: 获取所有图书与自动校阅规则的关联列表
     *     description: 返回系统中所有图书与自动校阅规则的关联记录（统一包装格式）
     *     tags:
     *       - Review - BookWithRule —— 自助校阅 - 书与规则绑定
     *       - Review
     *     responses:
     *       200:
     *         description: 成功返回关联列表
     *         content:
     *           application/json:
     *             schema:
     *               $ref: '#/components/schemas/ReviewBookRuleListResponse'
     *             examples:
     *               success:
     *                 $ref: '#/components/examples/ReviewBookRuleListSuccess'
     *               empty:
     *                 $ref: '#/components/examples/ReviewBookRuleListEmpty'
     *       500:
     *         description: 服务器内部错误
     */
    async listAll(ctx) {
        ctx.body = await this.#reviewRuleUsingService.list();
    }

    /**
     * @swagger
     * /review/bookwithrule/book:
     *   get:
     *     summary: 获取指定图书的自动校阅规则列表
     *     description: 根据图书 ID 返回该图书关联的所有自动校阅规则（统一包装格式）
     *     tags:
     *       - Review - BookWithRule —— 自助校阅 - 书与规则绑定
     *       - Review
     *     parameters:
     *       - $ref: '#/components/parameters/BookIdQuery'
     *     responses:
     *       200:
     *         description: 成功返回关联列表
     *         content:
     *           application/json:
     *             schema:
     *               $ref: '#/components/schemas/ReviewBookRuleListResponse'
     *             examples:
     *               success:
     *                 $ref: '#/components/examples/ReviewBookRuleListSuccess'
     *               empty:
     *                 $ref: '#/components/examples/ReviewBookRuleListEmpty'
     *       400:
     *         description: 参数错误（bookid 缺失或非数字）
     *         content:
     *           application/json:
     *             schema:
     *               $ref: '#/components/schemas/ApiErrorResponse'
     *             example:
     *               code: 60000
     *               msg: "bookid 必须为有效整数"
     *               timestamp: "2026-08-30T10:00:00.000Z"
     *       500:
     *         description: 服务器内部错误
     */
    async getByBookId(ctx) {
        const bookId = BookIdRequest.fromQuery(ctx.query);
        ctx.body = await this.#reviewRuleUsingService.getByBookId(bookId);
    }

    /**
     * @swagger
     * /review/bookwithrule:
     *   post:
     *     summary: 为图书关联审核规则
     *     description: 将指定图书与审核规则关联，用于后续审核流程（统一包装格式）
     *     tags:
     *       - Review - BookWithRule —— 自助校阅 - 书与规则绑定
     *       - Review
     *     requestBody:
     *       required: true
     *       content:
     *         application/json:
     *           schema:
     *             $ref: '#/components/schemas/AddBookRuleRequest'
     *           examples:
     *             default:
     *               $ref: '#/components/examples/AddBookRuleRequestExample'
     *     responses:
     *       200:
     *         description: 关联成功
     *         content:
     *           application/json:
     *             schema:
     *               $ref: '#/components/schemas/ApiSuccessResponse'
     *             example:
     *               code: 20000
     *               msg: "success"
     *               timestamp: "2026-08-30T12:00:00.000Z"
     *       400:
     *         description: 请求参数错误（如 bookId 或 ruleId 缺失）
     *         content:
     *           application/json:
     *             schema:
     *               $ref: '#/components/schemas/ApiErrorResponse'
     *             example:
     *               code: 60000
     *               msg: "bookId 和 ruleId 为必填字段"
     *               timestamp: "2026-08-30T12:00:00.000Z"
     *       404:
     *         description: 图书或规则不存在
     *         content:
     *           application/json:
     *             schema:
     *               $ref: '#/components/schemas/ApiErrorResponse'
     *             example:
     *               code: 40400
     *               msg: "未找到该图书或规则"
     *               timestamp: "2026-08-30T12:00:00.000Z"
     *       500:
     *         description: 服务器内部错误
     */
    async addBookRule(ctx) {
        const { bookId, ruleId } = ctx.request.body;
        ctx.body = await this.#reviewRuleUsingService.addBookRule(bookId, ruleId);
    }

    /**
     * @swagger
     * /review/bookwithrule:
     *   delete:
     *     summary: 删除图书与审核规则的关联
     *     description: 根据关联记录 ID 解除图书与审核规则的绑定关系（统一包装格式）
     *     tags:
     *       - Review - BookWithRule —— 自助校阅 - 书与规则绑定
     *       - Review
     *     parameters:
     *       - $ref: '#/components/parameters/IdRequest'
     *     responses:
     *       200:
     *         description: 删除成功
     *         content:
     *           application/json:
     *             schema:
     *               $ref: '#/components/schemas/ApiSuccessResponse'
     *             example:
     *               code: 20000
     *               msg: "success"
     *               timestamp: "2026-08-30T14:00:00.000Z"
     *       400:
     *         description: 参数错误（id 缺失或非数字）
     *         content:
     *           application/json:
     *             schema:
     *               $ref: '#/components/schemas/ApiErrorResponse'
     *             example:
     *               code: 60000
     *               msg: "id 必须为有效整数"
     *               timestamp: "2026-08-30T14:00:00.000Z"
     *       404:
     *         description: 关联记录不存在
     *         content:
     *           application/json:
     *             schema:
     *               $ref: '#/components/schemas/ApiErrorResponse'
     *             example:
     *               code: 40400
     *               msg: "未找到该关联记录"
     *               timestamp: "2026-08-30T14:00:00.000Z"
     *       500:
     *         description: 服务器内部错误
     */
    async deleteBookRule(ctx) {
        const id = IdRequest.fromQuery(ctx.query);
        ctx.body = await this.#reviewRuleUsingService.deleteBookRule(id);
    }
}