import { HostRequest } from "../dtos/ruleForWeb/RuleForWebResponse.dto.js"
import { WebBookSourceURLService } from "../../../2-application/services/WebBookSourceURLService.js";
import { AppError, UserInputError } from '../../../5-shared/errors/index.js';

export class WebBookSourceURLController {
    #webBookSourceURLService;
    /**
     * @param {WebBookSourceURLService} webBookSourceURLService 
     * @param {WebBookSourceURLCommandService} webBookSourceURLCommandService 
     */
    constructor(webBookSourceURLService) {
        this.#webBookSourceURLService = webBookSourceURLService;
    }

    /**
     * @swagger
     * /services/botrule/changehostname:
     *   post:
     *     summary: 批量更改规则的主机名
     *     description: 将指定主机名下的所有规则更新为新的主机名（统一包装格式）
     *     tags:
     *       - Services - BotRule —— 系统服务：机器人爬网规则
     *       - WebBook
     *     requestBody:
     *       required: true
     *       content:
     *         application/json:
     *           schema:
     *             $ref: '#/components/schemas/ChangeHostnameRequest'
     *           examples:
     *             default:
     *               $ref: '#/components/examples/ChangeHostnameRequestExample'
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
     *               timestamp: "2026-08-30T23:00:00.000Z"
     *       400:
     *         description: 请求参数错误（如 oldHostname 或 newHostname 缺失）
     *         content:
     *           application/json:
     *             schema:
     *               $ref: '#/components/schemas/ApiErrorResponse'
     *             example:
     *               code: 60000
     *               msg: "oldHostname 和 newHostname 为必填字段"
     *               timestamp: "2026-08-30T23:00:00.000Z"
     *       404:
     *         description: 原主机名下无规则
     *         content:
     *           application/json:
     *             schema:
     *               $ref: '#/components/schemas/ApiErrorResponse'
     *             example:
     *               code: 40400
     *               msg: "未找到该主机的规则"
     *               timestamp: "2026-08-30T23:00:00.000Z"
     *       500:
     *         description: 服务器内部错误
     */
    async changeHostname(ctx) {
        const { oldHostname, newHostname } = HostRequest.newOldHostInBody(ctx.request.body);
        const result = await this.#webBookSourceURLService.changeHostname(oldHostname, newHostname);
        ctx.body = result;
    }

    /**
     * @swagger
     * /library/webbook/addnewsource:
     *   post:
     *     summary: 为网页图书添加新源
     *     description: 为指定的网页图书新增一个源地址（统一包装格式）
     *     tags:
     *       - Library - WebBook —— 网文图书馆
     *       - WebBook
     *     requestBody:
     *       required: true
     *       content:
     *         application/json:
     *           schema:
     *             $ref: '#/components/schemas/AddWebBookSourceRequest'
     *           examples:
     *             default:
     *               $ref: '#/components/examples/AddWebBookSourceRequestExample'
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
     *               timestamp: "2026-09-09T10:00:00.000Z"
     *       400:
     *         description: 请求参数错误（如 bookId 缺失或非数字、url 格式无效）
     *         content:
     *           application/json:
     *             schema:
     *               $ref: '#/components/schemas/ApiErrorResponse'
     *             example:
     *               code: 60000
     *               msg: "bookId 必须为有效整数，url 必须为有效 URL"
     *               timestamp: "2026-09-09T10:00:00.000Z"
     *       404:
     *         description: 指定的网页图书不存在
     *         content:
     *           application/json:
     *             schema:
     *               $ref: '#/components/schemas/ApiErrorResponse'
     *             example:
     *               code: 40400
     *               msg: "未找到该网页图书"
     *               timestamp: "2026-09-09T10:00:00.000Z"
     *       500:
     *         description: 服务器内部错误
     */
    async addWebBookSource(ctx) {
        const { bookId, url: sourceURL } = ctx.request.body;
        const result = await this.#webBookSourceURLService.addSource(bookId, sourceURL);
        ctx.body = result;
    }
}