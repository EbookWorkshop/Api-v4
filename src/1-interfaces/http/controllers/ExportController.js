import { ExportBookRequest } from "../dtos/book/BookExportRequest.dto.js"
export class ExportController {
    /**@type ExportService */
    #exportService;

    constructor(exportService) {
        this.#exportService = exportService;
    }

    async todo(ctx) {
        console.log("TODO::", ctx.method, ctx.request.path)
        console.log(JSON.stringify(ctx.request.body));
        ctx.body = `Todo:: ${ctx.method}  ${ctx.request.path}`;
    }

    /**
     * @swagger
     * /export/epub:
     *   post:
     *     summary: 导出 EPUB 格式
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
        this.todo(ctx);
        const setting = ExportBookRequest.fromBody(ctx.request.body);
        // const params = ctx.request.body;
        // ctx.body = await this.#exportService.exportEpub(params);
    }

    /**
     * @swagger
     * /export/pdf:
     *   post:
     *     summary: 导出 PDF 格式
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
        this.todo(ctx);
        const setting = ExportBookRequest.fromBody(ctx.request.body);
        // const params = ctx.request.body;
        // ctx.body = await this.#exportService.exportPdf(params);
    }

    /**
     * @swagger
     * /export/txt:
     *   post:
     *     summary: 导出 TXT 格式
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
        this.todo(ctx);
        const setting = ExportBookRequest.fromBody(ctx.request.body);
        // const params = ctx.request.body;
        // ctx.body = await this.#exportService.exportTxt(params);
    }
}