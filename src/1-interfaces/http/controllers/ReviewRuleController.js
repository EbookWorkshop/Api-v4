
import { ReviewRuleQueryService } from "../../../2-application/services/ReviewRuleQueryService.js";
import { ReviewRuleRequest } from "../dtos/reviewRule/ReviewRuleRequest.dto.js";
import { IdRequest } from "../dtos/components/IdRequest.dto.js";

export class ReviewRuleController {
    #reviewRuleQueryService;
    #reviewRuleCommandService;

    /**
     * @param {ReviewRuleQueryService} reviewRuleQueryService 
     */
    constructor(reviewRuleQueryService, reviewRuleCommandService) {
        this.#reviewRuleQueryService = reviewRuleQueryService;
        this.#reviewRuleCommandService = reviewRuleCommandService;
    }

    /**
     * @swagger
     * /review/rule/list:
     *   get:
     *     summary: 获取校阅规则列表
     *     description: 返回所有校阅规则，包含规则详情和引用次数（统一包装格式）
     *     tags:
     *       - Review - Rule —— 自助校阅 - 规则库
     *       - Review
     *     responses:
     *       200:
     *         description: 成功返回校阅规则列表
     *         content:
     *           application/json:
     *             schema:
     *               $ref: '#/components/schemas/ReviewRuleListResponse'
     *             examples:
     *               success:
     *                 $ref: '#/components/examples/ReviewRuleListSuccess'
     *               empty:
     *                 $ref: '#/components/examples/ReviewRuleListEmpty'
     *       500:
     *         description: 服务器内部错误
     */
    async listReviewRule(ctx) {
        ctx.body = await this.#reviewRuleQueryService.findAll();
    }
    /**
     * @swagger
     * /review/rule:
     *   post:
     *     summary: 创建或更新校阅规则
     *     description: |
     *       提交规则信息，若 `id` 为空字符串则创建新规则，若 `id` 为有效数字则更新对应规则。
     *       返回操作后的规则详情（统一包装格式）。
     *     tags:
     *       - Review - Rule —— 自助校阅 - 规则库
     *       - Review
     *     requestBody:
     *       required: true
     *       content:
     *         application/json:
     *           schema:
     *             $ref: '#/components/schemas/ReviewRuleRequest'
     *           examples:
     *             create:
     *               $ref: '#/components/examples/ReviewRuleCreateRequest'
     *             update:
     *               $ref: '#/components/examples/ReviewRuleUpdateRequest'
     *     responses:
     *       200:
     *         description: 操作成功，返回规则详情
     *         content:
     *           application/json:
     *             schema:
     *               allOf:
     *                 - $ref: '#/components/schemas/ApiResponse'
     *                 - type: object
     *                   properties:
     *                     data:
     *                       allOf:
     *                         - $ref: '#/components/schemas/ReviewRuleBase'
     *                         - type: object
     *                           properties:
     *                             addToBook:
     *                               type: integer
     *                               description: 已添加到引用的书籍数量
     *                               example: 2
     *                           required:
     *                             - addToBook
     *             examples:
     *               success:
     *                 $ref: '#/components/examples/ReviewRuleCreateResponse'
     *       600:
     *         description: 请求参数错误（如缺少必填字段或 bookId 非数字数组）
     *         content:
     *           application/json:
     *             schema:
     *               $ref: '#/components/schemas/ApiErrorResponse'
     *             example:
     *               code: 60000
     *               msg: "bookId 必须为整数数组"
     *               timestamp: "2026-08-16T14:00:00.000Z"
     *       500:
     *         description: 服务器内部错误
     */
    async createOrUpdateReviewRule(ctx) {
        const rule = ReviewRuleRequest.fromBody(ctx.request.body);
        ctx.body = await this.#reviewRuleCommandService.createOrUpdateReviewRule(rule);
    }

    /**
     * @swagger
     * /review/rule:
     *   delete:
     *     summary: 删除校阅规则
     *     description: 根据规则 ID 删除指定的校阅规则
     *     tags:
     *       - Review - Rule —— 自助校阅 - 规则库
     *       - Review
     *     parameters:
     *       - $ref: '#/components/parameters/IdQuery'
     *     responses:
     *       200:
     *         description: 删除成功，返回统一成功信息
     *         content:
     *           application/json:
     *             schema:
     *               $ref: '#/components/schemas/ApiSuccessResponse'
     *       600:
     *         description: 参数错误（如 id 非数字）
     *         content:
     *           application/json:
     *             schema:
     *               $ref: '#/components/schemas/ApiErrorResponse'
     *             example:
     *               code: 60000
     *               msg: "无效的规则 ID"
     *               timestamp: "2026-08-17T10:00:00.000Z"
     *       404:
     *         description: 规则不存在
     *         content:
     *           application/json:
     *             schema:
     *               $ref: '#/components/schemas/ApiErrorResponse'
     *             example:
     *               code: 40400
     *               msg: "未找到该规则"
     *               timestamp: "2026-08-17T10:00:00.000Z"
     *       500:
     *         description: 服务器内部错误
     */
    async deleteReviewRule(ctx) {
        const id = IdRequest.fromQuery(ctx.query);
        ctx.body = await this.#reviewRuleCommandService.deleteReviewRuleById(id);
    }
}