
import { ServiceQueryService } from "../../../2-application/services/ServiceQueryService.js";
import { getHost } from "../../../5-shared/utils/site.js"

export class ServiceController {
    #serviceQueryService;
    #taskSchedulerService;
    /**
     * @param {ServiceQueryService} serviceQueryService 
     */
    constructor(serviceQueryService, taskSchedulerService) {
        this.#serviceQueryService = serviceQueryService;
        this.#taskSchedulerService = taskSchedulerService;
    }

    /**
     * @swagger
     * /services/version:
     *   get:
     *     summary: 获取系统版本信息
     *     description: 返回当前应用的版本、依赖包版本、环境数据路径、数据库大小、Node版本、操作系统信息、CPU和内存等（统一包装格式）
     *     tags:
     *       - Services - 基础 —— 系统服务：基础
     *       - Service
     *     responses:
     *       200:
     *         description: 成功返回版本信息
     *         content:
     *           application/json:
     *             schema:
     *               $ref: '#/components/schemas/VersionInfoResponse'
     *             examples:
     *               success:
     *                 $ref: '#/components/examples/VersionInfoSuccess'
     *       500:
     *         description: 服务器内部错误
     */
    async getVersion(ctx) {
        ctx.body = await this.#serviceQueryService.getVersionInfo();
    }
    /**
     * @swagger
     * /services/version:
     *   post:
     *     summary: 更新系统各依赖版本信息
     *     description: 更新系统各依赖版本信息
     *     tags:
     *       - Services - 基础 —— 系统服务：基础
     *       - Service
     *     responses:
     *       200:
     *         description: 任务提交即返回
     *         content:
     *           application/json:
     *             schema:
     *               $ref: '#/components/schemas/ApiSuccessResponse'
     *             example:
     *               code: 20000
     *               msg: "success"
     *               timestamp: "2026-08-30T18:00:00.000Z"
     *       500:
     *         description: 服务器内部错误
     */
    async updateVersion(ctx) {
        ctx.body = await this.#taskSchedulerService.submitUpdateVersion();
    }

    /**
     * @swagger
     * /services/checkSiteAccessibility:
     *   get:
     *     summary: 检查网站可访问性
     *     description: 对指定主机发起请求，检测是否可正常访问并返回状态信息（统一包装格式）
     *     tags:
     *       - Services - 基础 —— 系统服务：基础
     *       - Service
     *     parameters:
     *       - $ref: '#/components/parameters/HostQuery'
     *     responses:
     *       200:
     *         description: 检测完成，返回结果
     *         content:
     *           application/json:
     *             schema:
     *               $ref: '#/components/schemas/SiteAccessibilityResponse'
     *             examples:
     *               success:
     *                 $ref: '#/components/examples/SiteAccessibilitySuccess'
     *               blocked:
     *                 $ref: '#/components/examples/SiteAccessibilityBlocked'
     *       400:
     *         description: 参数错误（host 缺失）
     *         content:
     *           application/json:
     *             schema:
     *               $ref: '#/components/schemas/ApiErrorResponse'
     *             example:
     *               code: 60000
     *               msg: "host 为必填参数"
     *               timestamp: "2026-08-30T16:00:00.000Z"
     *       500:
     *         description: 服务器内部错误
     */
    async checkSiteAccessibility(ctx) {
        let host = getHost(ctx.query.host);
        ctx.body = await this.#serviceQueryService.checkSiteAccessibility(host);
    }
}