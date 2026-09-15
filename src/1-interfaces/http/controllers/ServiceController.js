
import { ServiceQueryService } from "../../../2-application/services/ServiceQueryService.js";
import { UserInputError } from "../../../5-shared/errors/index.js";
import { getHost } from "../../../5-shared/utils/site.js"

export class ServiceController {
    #serviceQueryService;
    #taskSchedulerService;
    /** @type {import("../../../2-application/services/BatchProgressTracker.js").BatchProgressTracker} */
    #batchProgressTracker;
    #pdfServide;
    /**
     * @param {ServiceQueryService} serviceQueryService
     * @param {import("../../../2-application/services/TaskSchedulerService.js").TaskSchedulerService} taskSchedulerService
     * @param {import("../../../2-application/services/BatchProgressTracker.js").BatchProgressTracker} batchProgressTracker
     */
    constructor(serviceQueryService, taskSchedulerService, batchProgressTracker, pdfServide) {
        this.#serviceQueryService = serviceQueryService;
        this.#taskSchedulerService = taskSchedulerService;
        this.#batchProgressTracker = batchProgressTracker;
        this.#pdfServide = pdfServide;
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
     *     summary: 🧵更新系统各依赖版本信息
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
        if (!host) throw new UserInputError("未提供host");
        ctx.body = await this.#serviceQueryService.checkSiteAccessibility(host);
    }

    /**
     * @swagger
     * /services/compress_db:
     *   post:
     *     summary: 🧵压缩数据库
     *     description: 压缩数据库
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
    async compressDatabase(ctx) {
        ctx.body = await this.#taskSchedulerService.submitCompressDdatabase();
    }

    /**
     * @swagger
     * /services/pdf/view:
     *   get:
     *     summary: 生成并查看 PDF 文档
     *     description: |
     *       根据章节 ID 或直接提供的内容生成 PDF 文档。
     *       **注意**：`chapterId` 和 `content` 二选一，至少提供一个，优先使用 `chapterId`（若提供）。
     *     tags:
     *       - Services - 基础 —— 系统服务：基础
     *       - Service
     *     parameters:
     *       - in: query
     *         name: chapterId
     *         schema:
     *           type: integer
     *         required: false
     *         description: 章节 ID（与 content 二选一）
     *         example: 56888
     *       - in: query
     *         name: content
     *         schema:
     *           type: string
     *         required: false
     *         description: 直接提供的文本内容（与 chapterId 二选一）
     *         example: "这是要生成 PDF 的文本内容..."
     *       - in: query
     *         name: fontsize
     *         schema:
     *           type: integer
     *         required: false
     *         description: 字体大小（单位 pt）
     *         example: 12
     *       - in: query
     *         name: fontfamily
     *         schema:
     *           type: string
     *         required: false
     *         description: 字体文件名（可不含扩展名）
     *         example: "字体.ttf"
     *     responses:
     *       200:
     *         description: 成功返回 PDF 文档
     *         content:
     *           application/pdf:
     *             schema:
     *               type: string
     *               format: binary
     *             example: "(PDF 二进制数据)"
     *       400:
     *         description: 参数错误（如 chapterId 和 content 均未提供）
     *         content:
     *           application/json:
     *             schema:
     *               $ref: '#/components/schemas/ApiErrorResponse'
     *             example:
     *               code: 60000
     *               msg: "请提供 chapterId 或 content"
     *               timestamp: "2026-09-15T10:00:00.000Z"
     *       404:
     *         description: 章节不存在或内容生成失败
     *         content:
     *           application/json:
     *             schema:
     *               $ref: '#/components/schemas/ApiErrorResponse'
     *             example:
     *               code: 40400
     *               msg: "未找到该章节"
     *               timestamp: "2026-09-15T10:00:00.000Z"
     *       500:
     *         description: 服务器内部错误
     */
    async viewOnPdf(ctx) {
        const { chapterId, content, ...setting } = ctx.query;
        ctx.state.skipResponseWrapper = true;
        ctx.set('Content-Type', "application/pdf");
        let buffer;
        if (!isNaN(chapterId)) {
            buffer = await this.#pdfServide.viewChapter(chapterId * 1, setting);
        } else if (content) {
            buffer = await this.#pdfServide.viewContent(content, setting);
        } else {
            throw new UserInputError("请提供 chapterId 或 content");
        }
        ctx.body = buffer;
    }

    /**
     * @swagger
     * /services/tasks/batch/{batchId}:
     *   get:
     *     summary: 查询批任务进度
     *     description: 根据 batchId 返回批次状态快照。用于前端断线重连后恢复进度展示。
     *     tags:
     *       - Services - 基础 —— 系统服务：基础
     *       - Service
     *     parameters:
     *       - in: path
     *         name: batchId
     *         schema:
     *           type: string
     *         required: true
     *         description: 批任务 ID
     *         example: "5b0b8e5c-8c0e-4b3a-9d3a-1e6f0f3d2b1a"
     *     responses:
     *       200:
     *         description: 成功返回批次状态
     *       404:
     *         description: 批次不存在或已过期
     *       500:
     *         description: 服务器内部错误
     */
    async getBatchProgress(ctx) {
        const { batchId } = ctx.params;
        if (!batchId) throw new UserInputError("batchId 不能为空");

        const status = this.#batchProgressTracker.getStatus(batchId);
        if (!status) {
            throw new UserInputError("批次不存在或已过期", 404);
        }
        ctx.body = status;
    }

    /**
     * @swagger
     * /services/tasks/batch:
     *   get:
     *     summary: 列出正在运行的批任务
     *     description: 返回当前主线程中所有 status=running 的批次快照。
     *     tags:
     *       - Services - 基础 —— 系统服务：基础
     *       - Service
     *     responses:
     *       200:
     *         description: 成功返回批次列表
     */
    async listRunningBatches(ctx) {
        ctx.body = this.#batchProgressTracker.listRunning();
    }
}