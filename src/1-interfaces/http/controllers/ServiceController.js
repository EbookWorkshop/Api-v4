
import { ServiceQueryService } from "../../../2-application/services/ServiceQueryService.js";

export class ServiceController {
    #serviceQueryService;
    /**
     * @param {ServiceQueryService} serviceQueryService 
     */
    constructor(serviceQueryService) {
        this.#serviceQueryService = serviceQueryService;
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
}