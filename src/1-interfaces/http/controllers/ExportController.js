import { ExportBookRequest } from "../dtos/book/BookExportRequest.dto.js"
import { TaskSchedulerService } from "../../../2-application/services/TaskSchedulerService.js";

export class ExportController {
    /**@type TaskSchedulerService */
    #taskSchedulerService;

    constructor(taskSchedulerService) {
        this.#taskSchedulerService = taskSchedulerService;
    }

    /**
     * @swagger
     * /export/epub:
     *   post:
     *     summary: 🧵导出 EPUB 格式
     *     description: 根据导出选项生成 EPUB 文件（统一包装格式）
     *     tags:
     *       - Export —— 图书馆产物
     *       - Export
     *     requestBody:
     *       required: true
     *       content:
     *         application/json:
     *           schema:
     *             $ref: '#/components/schemas/ExportBookRequest'
     *           examples:
     *             default:
     *               $ref: '#/components/examples/ExportBookRequestExample'
     *     responses:
     *       200:
     *         description: 导出任务已触发（或返回文件），此处仅表示成功
     *         content:
     *           application/json:
     *             schema:
     *               $ref: '#/components/schemas/ApiSuccessResponse'
     *             example:
     *               code: 20000
     *               msg: "导出成功"
     *               timestamp: "2026-08-24T12:00:00.000Z"
     *       400:
     *         description: 请求参数错误（如 bookId 缺失或非数字）
     *         content:
     *           application/json:
     *             schema:
     *               $ref: '#/components/schemas/ApiErrorResponse'
     *             example:
     *               code: 60000
     *               msg: "bookId 必须为有效整数"
     *               timestamp: "2026-08-24T12:00:00.000Z"
     *       500:
     *         description: 服务器内部错误
     */
    async exportEpub(ctx) {
        const setting = ExportBookRequest.fromBody(ctx.request.body);
        setting.format = "epub";
        ctx.body = await this.#taskSchedulerService.submitExportTask(setting);
    }

    /**
     * @swagger
     * /export/pdf:
     *   post:
     *     summary: 🧵导出 PDF 格式
     *     description: 根据导出选项生成 PDF 文件（统一包装格式）
     *     tags:
     *       - Export —— 图书馆产物
     *       - Export
     *     requestBody:
     *       required: true
     *       content:
     *         application/json:
     *           schema:
     *             $ref: '#/components/schemas/ExportBookRequest'
     *           examples:
     *             default:
     *               $ref: '#/components/examples/ExportBookRequestExample'
     *     responses:
     *       200:
     *         description: 导出任务已触发（或返回文件），此处仅表示成功
     *         content:
     *           application/json:
     *             schema:
     *               $ref: '#/components/schemas/ApiSuccessResponse'
     *             example:
     *               code: 20000
     *               msg: "导出成功"
     *               timestamp: "2026-08-24T12:00:00.000Z"
     *       400:
     *         description: 请求参数错误
     *         content:
     *           application/json:
     *             schema:
     *               $ref: '#/components/schemas/ApiErrorResponse'
     *             example:
     *               code: 60000
     *               msg: "bookId 必须为有效整数"
     *               timestamp: "2026-08-24T12:00:00.000Z"
     *       500:
     *         description: 服务器内部错误
     */
    async exportPdf(ctx) {
        const setting = ExportBookRequest.fromBody(ctx.request.body);
        setting.format = "pdf";
        ctx.body = await this.#taskSchedulerService.submitExportTask(setting);
    }

    /**
     * @swagger
     * /export/txt:
     *   post:
     *     summary: 🧵导出 TXT 格式
     *     description: 根据导出选项生成 TXT 文件（统一包装格式）
     *     tags:
     *       - Export —— 图书馆产物
     *       - Export
     *     requestBody:
     *       required: true
     *       content:
     *         application/json:
     *           schema:
     *             $ref: '#/components/schemas/ExportBookRequest'
     *           examples:
     *             default:
     *               $ref: '#/components/examples/ExportBookRequestExample'
     *     responses:
     *       200:
     *         description: 导出任务已触发（或返回文件），此处仅表示成功
     *         content:
     *           application/json:
     *             schema:
     *               $ref: '#/components/schemas/ApiSuccessResponse'
     *             example:
     *               code: 20000
     *               msg: "导出成功"
     *               timestamp: "2026-08-24T12:00:00.000Z"
     *       400:
     *         description: 请求参数错误
     *         content:
     *           application/json:
     *             schema:
     *               $ref: '#/components/schemas/ApiErrorResponse'
     *             example:
     *               code: 60000
     *               msg: "bookId 必须为有效整数"
     *               timestamp: "2026-08-24T12:00:00.000Z"
     *       500:
     *         description: 服务器内部错误
     */
    async exportTxt(ctx) {
        const setting = ExportBookRequest.fromBody(ctx.request.body);
        setting.format = "txt";
        ctx.body = await this.#taskSchedulerService.submitExportTask(setting);
    }
}