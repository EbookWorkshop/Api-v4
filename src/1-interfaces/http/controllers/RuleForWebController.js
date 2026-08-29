
import { RuleForWebQueryService } from "../../../2-application/services/RuleForWebQueryService.js";
import { RuleForWebCommandService } from "../../../2-application/services/RuleForWebCommandService.js";

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
    async listBotRuleHosts(ctx) {
        ctx.body = await this.#ruleForWebQueryService.listHosts();
    }

    /**
     * @swagger
     * /services/botrule:
     *   get:
     *     summary: 获取指定主机的 Bot 规则列表
     *     description: 根据主机名返回该站点下的所有爬虫规则（统一包装格式）
     *     tags:
     *       - Services - BotRule —— 系统服务：机器人爬网规则
     *       - BotRule
     *     parameters:
     *       - $ref: '#/components/parameters/BotRuleHostQuery'
     *     responses:
     *       200:
     *         description: 成功返回规则列表
     *         content:
     *           application/json:
     *             schema:
     *               $ref: '#/components/schemas/BotRuleListResponse'
     *             examples:
     *               success:
     *                 $ref: '#/components/examples/BotRuleListSuccess'
     *               empty:
     *                 $ref: '#/components/examples/BotRuleListEmpty'
     *       400:
     *         description: 参数错误（host 缺失）
     *         content:
     *           application/json:
     *             schema:
     *               $ref: '#/components/schemas/ApiErrorResponse'
     *             example:
     *               code: 60000
     *               msg: "host 为必填参数"
     *               timestamp: "2026-08-29T14:00:00.000Z"
     *       500:
     *         description: 服务器内部错误
     */
    async getBotRules(ctx) {
        const host = ctx.query.host;
        const result = await this.#ruleForWebQueryService.getRulesByHost(host);
        ctx.body = result;
    }

    /**
     * @swagger
     * /services/botrule/export:
     *   get:
     *     tags:
     *       - Services - BotRule —— 系统服务：机器人爬网规则
     *       - BotRule
     *     summary: 导出指定站点的规则
     *     description: 导出指定站点的规则——用于备份，数据迁移等
     *     parameters:
     *       - $ref: '#/components/parameters/BotRuleHostQuery'
     *     responses:
     *       200:
     *         description: 请求成功
     *       600:
     *         description: 参数错误，参数类型错误
     */
    async exportRules(ctx) {
        const host = ctx.query.host;
        ctx.body = JSON.stringify(await this.#ruleForWebQueryService.getRulesByHost(host));
        ctx.state.skipResponseWrapper = true;
        ctx.set("Content-Type", "application/octet-stream");
        ctx.set("Content-Disposition", `attachment;filename=EBW_botrule_export_${host}.json`);
    }
}