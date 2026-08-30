
import { AssetsService } from "../../../2-application/services/AssetsService.js";
import { UserInputError } from "../../../5-shared/errors/UserInputError.js";

export class AssetsController {
    #assetsService;
    /**
     * @param {AssetsService} assetsService 
     */
    constructor(assetsService) {
        this.#assetsService = assetsService;
    }

    /**
     * @swagger
     * /assets/archive/book:
     *   get:
     *     summary: 获取归档图书文件列表
     *     description: 返回所有已归档的图书文件信息（统一包装格式）
     *     tags:
     *       - Assets —— 资源管理
     *       - Assets
     *     responses:
     *       200:
     *         description: 成功返回文件列表
     *         content:
     *           application/json:
     *             schema:
     *               $ref: '#/components/schemas/ArchiveBookListResponse'
     *             examples:
     *               success:
     *                 $ref: '#/components/examples/ArchiveBookListSuccess'
     *               empty:
     *                 $ref: '#/components/examples/ArchiveBookListEmpty'
     *       500:
     *         description: 服务器内部错误
     */
    async listArchiveBooks(ctx) {
        ctx.body = await this.#assetsService.listArchiveBooks();
    }

    /**
     * @swagger
     * /assets/archive/book:
     *   post:
     *     summary: 重命名归档文件
     *     description: 将指定的归档文件重命名为新文件名（统一包装格式）
     *     tags:
     *       - Assets —— 资源管理
     *       - Assets
     *     requestBody:
     *       required: true
     *       content:
     *         application/json:
     *           schema:
     *             $ref: '#/components/schemas/RenameArchiveRequest'
     *           examples:
     *             default:
     *               $ref: '#/components/examples/RenameArchiveRequestExample'
     *     responses:
     *       200:
     *         description: 重命名成功
     *         content:
     *           application/json:
     *             schema:
     *               $ref: '#/components/schemas/ApiSuccessResponse'
     *             example:
     *               code: 20000
     *               msg: "success"
     *               timestamp: "2026-08-30T20:00:00.000Z"
     *       400:
     *         description: 请求参数错误（如缺少必填字段、文件不存在或新文件名已存在）
     *         content:
     *           application/json:
     *             schema:
     *               $ref: '#/components/schemas/ApiErrorResponse'
     *             example:
     *               code: 60000
     *               msg: "file 和 name 为必填字段，且文件必须存在"
     *               timestamp: "2026-08-30T20:00:00.000Z"
     *       404:
     *         description: 原文件不存在
     *         content:
     *           application/json:
     *             schema:
     *               $ref: '#/components/schemas/ApiErrorResponse'
     *             example:
     *               code: 40400
     *               msg: "未找到该文件"
     *               timestamp: "2026-08-30T20:00:00.000Z"
     *       500:
     *         description: 服务器内部错误
     */
    async renameFile(ctx) {
        const { file, name } = ctx.request.body;
        const result = await this.#assetsService.renameFile(file, name);
        ctx.body = result;
    }

    /**
     * @swagger
     * /assets/archive/book/{name}:
     *   delete:
     *     summary: 删除归档文件
     *     description: 根据文件名删除指定的归档文件（统一包装格式）
     *     tags:
     *       - Assets —— 资源管理
     *       - Assets
     *     parameters:
     *       - $ref: '#/components/parameters/ArchiveNameParam'
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
     *               timestamp: "2026-08-29T12:00:00.000Z"
     *       400:
     *         description: 参数错误（name 缺失或为空）
     *         content:
     *           application/json:
     *             schema:
     *               $ref: '#/components/schemas/ApiErrorResponse'
     *             example:
     *               code: 60000
     *               msg: "文件名不能为空"
     *               timestamp: "2026-08-29T12:00:00.000Z"
     *       404:
     *         description: 文件不存在
     *         content:
     *           application/json:
     *             schema:
     *               $ref: '#/components/schemas/ApiErrorResponse'
     *             example:
     *               code: 40400
     *               msg: "未找到该文件"
     *               timestamp: "2026-08-29T12:00:00.000Z"
     *       500:
     *         description: 服务器内部错误
     */
    async deleteArchiveFile(ctx) {
        const fileName = ctx.params.name;
        if (!fileName) throw UserInputError("文件名不能为空");
        await this.#assetsService.deleteFile(fileName);
        ctx.body = true;
    }
}