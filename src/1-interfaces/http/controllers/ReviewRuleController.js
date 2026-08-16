
import { ReviewRuleQueryService } from "../../../2-application/services/ReviewRuleQueryService.js";
import { AppError } from '../../../5-shared/errors/AppError.js';

export class ReviewRuleController {
    #reviewRuleQueryService;

    /**
     * @param {ReviewRuleQueryService} reviewRuleQueryService 
     */
    constructor(reviewRuleQueryService) {
        this.#reviewRuleQueryService = reviewRuleQueryService;
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
}