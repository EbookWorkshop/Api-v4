
import { ReviewRuleQueryService } from "../../../2-application/services/ReviewRuleQueryService.js";
import { AppError } from '../../../5-shared/errors/AppError.js';

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
     *     summary: 获取审核规则列表
     *     description: 返回所有审核规则，包含规则详情和引用次数（统一包装格式）
     *     tags:
     *       - Review - Rule —— 自助校阅 - 规则库
     *       - Review
     *     responses:
     *       200:
     *         description: 成功返回审核规则列表
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
     *     summary: 创建或更新审核规则
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
        const { id, name, rule, replace, bookId } = ctx.request.body;
        if (bookId?.length > 0 && bookId.some(i => isNaN(i * 1))) throw new AppError("bookId 必须为整数数组", 600);
        if (!name) throw new AppError("规则名为必填项", 600);
        if (!rule) throw new AppError("校阅规则为必填项", 600);
        ctx.body = await this.#reviewRuleCommandService.createOrUpdateReviewRule({ id, name, rule, replace, bookId });
    }
}