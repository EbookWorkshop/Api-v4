
import { RuleForWebQueryService } from "../../../2-application/services/RuleForWebQueryService.js";
import { RuleForWebCommandService } from "../../../2-application/services/RuleForWebCommandService.js";
import { AppError, UserInputError } from '../../../5-shared/errors/index.js';

export class RuleForWebController {
    #ruleForWebQueryService;
    #ruleForWebCommandService;
    /**
     * @param {RuleForWebQueryService} ruleForWebQueryService 
     * @param {RuleForWebCommandService} ruleForWebCommandService 
     */
    constructor(ruleForWebQueryService, ruleForWebCommandService) {
        this.#ruleForWebQueryService = ruleForWebQueryService;
        this.#ruleForWebCommandService = ruleForWebCommandService;
    }
    
    /**
     * @swagger
     * /services/botrule/hostlist:
     *   get:
     *     summary: 获取 Bot 规则主机列表
     *     description: 返回所有可用的主机地址列表（统一包装格式）
     *     tags:
     *       - Services - BotRule —— 系统服务：机器人爬网规则
     *       - BotRule
     *     responses:
     *       200:
     *         description: 成功返回主机列表
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
     *             example:
     *               code: 20000
     *               msg: "success"
     *               timestamp: "2026-08-20T20:00:00.000Z"
     *               data: ["host1.example.com", "host2.example.com"]
     *       500:
     *         description: 服务器内部错误
     */
    async getBotRuleHostList(ctx) {
        ctx.body = await this.#ruleForWebQueryService.listHosts();
    }
}