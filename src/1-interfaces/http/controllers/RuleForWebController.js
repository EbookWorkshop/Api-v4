import { HostRequest } from "../dtos/ruleForWeb/RuleForWebResponse.dto.js";
import { RuleForWebQueryService } from "../../../2-application/services/RuleForWebQueryService.js";
import { RuleForWebCommandService } from "../../../2-application/services/RuleForWebCommandService.js";
import { VisRuleRequest } from "../dtos/ruleForWeb/VisRuleRequest.dto.js";

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
     *                 $ref: '#/components/examples/ResultListEmpty'
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
        const host = HostRequest.inQuery(ctx.query);
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
        const host = HostRequest.inQuery(ctx.query);
        ctx.body = JSON.stringify(await this.#ruleForWebQueryService.getRulesByHost(host));
        ctx.state.skipResponseWrapper = true;
        ctx.set("Content-Type", "application/octet-stream");
        ctx.set("Content-Disposition", `attachment;filename=EBW_botrule_export_${host}.json`);
    }

    /**
     * @swagger
     * /services/botrule/dictionaries:
     *   get:
     *     tags:
     *       - Services - BotRule —— 系统服务：机器人爬网规则
     *       - BotRule
     *     summary: 拿到指定站点的字典
     *     description: 拿到指定站点的字典
     *     parameters:
     *       - $ref: '#/components/parameters/BotRuleHostQuery'
     *     responses:
     *       200:
     *         description: 成功返回规则列表
     *         content:
     *           application/json:
     *             schema:
     *               $ref: '#/components/schemas/DictionaryListResponse'
     *             examples:
     *               success:
     *                 $ref: '#/components/examples/DictionaryListResponse'
     *               empty:
     *                 $ref: '#/components/examples/ResultListEmpty'
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
     */
    async getDictionaryByURL(ctx) {
        const host = HostRequest.inQuery(ctx.query);
        ctx.body = await this.#ruleForWebQueryService.getDictionaryByURL(host);
    }

    /**
     * @swagger
     * /services/botrule/registeredwebsites:
     *   get:
     *     summary: 获取已注册的网站列表
     *     description: 返回所有已配置规则的网站及其关联图书统计信息（统一包装格式）
     *     tags:
     *       - Services - BotRule —— 系统服务：机器人爬网规则
     *       - BotRule
     *     responses:
     *       200:
     *         description: 成功返回网站列表
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
     *                         type: object
     *                         properties:
     *                           Host:
     *                             type: string
     *                             description: 网站主机名
     *                             example: "www.example.com"
     *                           BookCount:
     *                             type: integer
     *                             description: 该网站下已抓取的图书数量
     *                             example: 2
     *                           LastAddedTime:
     *                             type: string
     *                             format: date-time
     *                             description: 最后添加时间（ISO 8601 格式）
     *                             example: "2025-03-23 18:20:27.802 +00:00"
     *                           Books:
     *                             type: array
     *                             items:
     *                               type: object
     *                               properties:
     *                                 BookId:
     *                                   type: integer
     *                                   description: 图书 ID
     *                                   example: 77
     *                                 BookName:
     *                                   type: string
     *                                   description: 图书名称
     *                                   example: "书籍一"
     *                               required:
     *                                 - BookId
     *                                 - BookName
     *                         required:
     *                           - Host
     *                           - BookCount
     *                           - LastAddedTime
     *                           - Books
     *             example:
     *               code: 20000
     *               msg: "success"
     *               timestamp: "2026-08-29T16:00:00.000Z"
     *               data:
     *                 - Host: "www.example.com"
     *                   BookCount: 2
     *                   LastAddedTime: "2025-03-23 18:20:27.802 +00:00"
     *                   Books:
     *                     - BookId: 77
     *                       BookName: "书籍一"
     *                     - BookId: 78
     *                       BookName: "书籍二"
     *                 - Host: "blog.example.org"
     *                   BookCount: 1
     *                   LastAddedTime: "2025-04-10 09:15:00.000 +00:00"
     *                   Books:
     *                     - BookId: 80
     *                       BookName: "示例书籍"
     *       500:
     *         description: 服务器内部错误
     */
    async listRegisteredWebsites(ctx) {
        ctx.body = await this.#ruleForWebQueryService.listRegisteredWebsites();
    }

    /**
     * @swagger
     * /services/botrule:
     *   post:
     *     summary: 批量创建或更新 Bot 规则
     *     description: 接收一个规则对象数组，用于批量添加或更新爬虫规则（统一包装格式）
     *     tags:
     *       - Services - BotRule —— 系统服务：机器人爬网规则
     *       - BotRule
     *     requestBody:
     *       required: true
     *       content:
     *         application/json:
     *           schema:
     *             type: array
     *             items:
     *               $ref: '#/components/schemas/BotRuleItem'
     *           examples:
     *             batch:
     *               summary: 批量规则示例
     *               value:
     *                 - host: "www.example.com"
     *                   ruleName: "BookName"
     *                   selector: "#book-title"
     *                   removeSelector: [".ad", ".footer"]
     *                   getContentAction: "text"
     *                   getUrlAction: "attr:href"
     *                   type: "Object"
     *                   checkSetting: ""
     *                 - host: "www.example.com"
     *                   ruleName: "ChapterList"
     *                   selector: "#chapter-list a"
     *                   removeSelector: []
     *                   getContentAction: "text"
     *                   getUrlAction: "attr:href"
     *                   type: "List"
     *                   checkSetting: ""
     *     responses:
     *       200:
     *         description: 操作成功
     *         content:
     *           application/json:
     *             schema:
     *               $ref: '#/components/schemas/ApiSuccessResponse'
     *             example:
     *               code: 20000
     *               msg: "success"
     *               timestamp: "2026-08-30T16:00:00.000Z"
     *       400:
     *         description: 请求参数错误
     *         content:
     *           application/json:
     *             schema:
     *               $ref: '#/components/schemas/ApiErrorResponse'
     *             example:
     *               code: 60000
     *               msg: "请求体必须为非空数组，且每个元素需包含必填字段"
     *               timestamp: "2026-08-30T16:00:00.000Z"
     *       500:
     *         description: 服务器内部错误
     */
    async batchUpsertBotRules(ctx) {
        const rules = ctx.request.body;//TODO: 接入DTO层
        const result = await this.#ruleForWebCommandService.batchUpsertRules(rules);
        ctx.body = result;
    }

    /**
     * @swagger
     * /services/botrule/vis:
     *   post:
     *     summary: 可视化测试 Bot 规则    
     *     description: 提交一个规则配置和测试 URL，返回模拟抓取结果，用于调试规则有效性（统一包装格式）
     *     tags:
     *       - Services - BotRule —— 系统服务：机器人爬网规则
     *       - BotRule
     *     requestBody:
     *       required: true
     *       content:
     *         application/json:
     *           schema:
     *             $ref: '#/components/schemas/VisRuleRequest'
     *           examples:
     *             default:
     *               $ref: '#/components/examples/VisRuleRequestExample'
     *     responses:
     *       200:
     *         description: 测试成功，返回抓取结果（具体数据结构可能为实际抓取内容，但按用户要求统一返回 ApiSuccessResponse 表示调用成功）
     *         content:
     *           application/json:
     *             schema:
     *               $ref: '#/components/schemas/ApiSuccessResponse'
     *             example:
     *               code: 20000
     *               msg: "success"
     *               timestamp: "2026-09-06T10:00:00.000Z"
     *       400:
     *         description: 请求参数错误（如缺少必填字段或 URL 格式无效）
     *         content:
     *           application/json:
     *             schema:
     *               $ref: '#/components/schemas/ApiErrorResponse'
     *             example:
     *               code: 60000
     *               msg: "testUrl 和 ruleName 等为必填字段"
     *               timestamp: "2026-09-06T10:00:00.000Z"
     *       500:
     *         description: 服务器内部错误
     */
    async visualizeBotRule(ctx) {
        const { testUrl, rule } = VisRuleRequest.fromBody(ctx.request.body);
        const result = await this.#ruleForWebQueryService.visualizeRule(testUrl, rule);
        ctx.body = result;
    }

    /**
     * @swagger
     * /services/botrule/import:
     *   post:
     *     summary: 从文件导入 Bot 规则（批量）
     *     description: 通过上传 JSON 文件批量创建或更新爬虫规则。文件内容应为 `BotRuleItem` 对象数组，格式与 `POST /services/botrule` 的请求体一致。（统一包装格式）
     *     tags:
     *       - Services - BotRule —— 系统服务：机器人爬网规则
     *       - BotRule
     *     requestBody:
     *       required: true
     *       content:
     *         multipart/form-data:
     *           schema:
     *             type: object
     *             properties:
     *               file:
     *                 type: string
     *                 format: binary
     *                 description: 包含规则数组的 JSON 文件（.json），内容为 `BotRuleItem[]`
     *           # 注：无法直接给出文件内容的 example，但可在描述中说明
     *     responses:
     *       200:
     *         description: 导入成功
     *         content:
     *           application/json:
     *             schema:
     *               $ref: '#/components/schemas/ApiSuccessResponse'
     *             example:
     *               code: 20000
     *               msg: "success"
     *               timestamp: "2026-08-30T18:00:00.000Z"
     *       400:
     *         description: 请求参数错误（未上传文件、文件格式不正确或内容不符合 Schema）
     *         content:
     *           application/json:
     *             schema:
     *               $ref: '#/components/schemas/ApiErrorResponse'
     *             example:
     *               code: 60000
     *               msg: "请上传 JSON 文件，且内容必须为 BotRuleItem 数组"
     *               timestamp: "2026-08-30T18:00:00.000Z"
     *       500:
     *         description: 服务器内部错误
     */
    async importBotRules(ctx) {
        const file = ctx.request.files?.data;//TODO: 接入DTO层
        const result = await this.#ruleForWebCommandService.importRulesFromFile(file);
        ctx.body = result;
    }

    /**
     * @swagger
     * /services/botrule/dictionaries:
     *   post:
     *     tags:
     *       - Services - BotRule —— 系统服务：机器人爬网规则
     *       - BotRule
     *     summary: 存储指定站点的字典
     *     description: 存储指定站点的翻译字典
     *     requestBody:
     *       required: true
     *       content:
     *         application/json:
     *           schema:
     *             type: object
     *             required:
     *               - host
     *               - data
     *             properties:
     *               host:
     *                 type: string
     *                 description: 站点host标识
     *               data:
     *                 type: array
     *                 description: 字典条目列表
     *                 items:
     *                   $ref: '#/components/schemas/DictionaryItem'
     *     responses:
     *       200:
     *         description: 请求成功
     *       600:
     *         description: 参数错误，参数类型错误
     */
    async saveDictionaries(ctx) {
        const { host, data } = ctx.request.body;
        ctx.body = await this.#ruleForWebCommandService.saveDictionaries(host, data);
    }

    /**
     * @swagger
     * /services/botrule:
     *   delete:
     *     summary: 删除指定主机的所有 Bot 规则
     *     description: 根据主机名删除该站点下配置的全部爬虫规则（统一包装格式）
     *     tags:
     *       - Services - BotRule —— 系统服务：机器人爬网规则
     *       - BotRule
     *     parameters:
     *       - $ref: '#/components/parameters/BotRuleHostQuery'
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
     *               timestamp: "2026-08-30T22:00:00.000Z"
     *       400:
     *         description: 参数错误（host 缺失）
     *         content:
     *           application/json:
     *             schema:
     *               $ref: '#/components/schemas/ApiErrorResponse'
     *             example:
     *               code: 60000
     *               msg: "host 为必填参数"
     *               timestamp: "2026-08-30T22:00:00.000Z"
     *       404:
     *         description: 该主机下无规则或主机不存在
     *         content:
     *           application/json:
     *             schema:
     *               $ref: '#/components/schemas/ApiErrorResponse'
     *             example:
     *               code: 40400
     *               msg: "未找到该主机的规则"
     *               timestamp: "2026-08-30T22:00:00.000Z"
     *       500:
     *         description: 服务器内部错误
     */
    async deleteBotRules(ctx) {
        const host = HostRequest.inQuery(ctx.query);
        const result = await this.#ruleForWebCommandService.deleteRulesByHost(host);
        ctx.body = result;
    }
}