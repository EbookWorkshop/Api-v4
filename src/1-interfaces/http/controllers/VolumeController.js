
import { VolumeQueryService } from "../../../2-application/services/VolumeQueryService.js";
import { VolumeCommandService } from "../../../2-application/services/VolumeCommandService.js";
import { UserInputError } from '../../../5-shared/errors/index.js';

export class VolumeController {
    #volumeQueryService;
    #volumeCommandService;

    /**
     * @param {VolumeQueryService} volumeQueryService 
     * @param {VolumeCommandService} volumeCommandService 
     */
    constructor(volumeQueryService, volumeCommandService) {
        this.#volumeQueryService = volumeQueryService;
        this.#volumeCommandService = volumeCommandService;
    }
    /**
     * @swagger
     * /library/book/volume/all:
     *   get:
     *     summary: 【卷】获取指定图书分卷列表
     *     description: 根据图书 ID 返回该图书的所有分卷信息（统一包装格式）
     *     tags:
     *       - Library —— 图书馆
     *       - Volume
     *     parameters:
     *       - $ref: '#/components/parameters/BookIdCamelCaseQuery'
     *     responses:
     *       200:
     *         description: 成功返回分卷列表
     *         content:
     *           application/json:
     *             schema:
     *               $ref: '#/components/schemas/BookVolumeListResponse'
     *             examples:
     *               success:
     *                 $ref: '#/components/examples/BookVolumeListSuccess'
     *               empty:
     *                 $ref: '#/components/examples/BookVolumeListEmpty'
     *       600:
     *         description: 请求参数错误（如 bookId 非数字或小于 1）
     *         content:
     *           application/json:
     *             schema:
     *               $ref: '#/components/schemas/ApiErrorResponse'
     *             example:
     *               code: 60000
     *               msg: "提供的书籍ID不正确。"
     *               timestamp: "2026-08-16T12:00:00.000Z"
     *       500:
     *         description: 服务器内部错误
     */
    async listVolumes(ctx) {
        const bookId = ctx.query.bookId * 1;
        if (isNaN(bookId)) throw new UserInputError("提供的书籍ID不正确。");
        ctx.body = await this.#volumeQueryService.findByBookId(bookId)
    }

    /**
     * @swagger
     * /library/book/volume:
     *   post:
     *     summary: 【卷】创建图书分卷
     *     description: 为指定图书创建新的分卷（卷），成功返回统一状态信息。
     *     tags:
     *       - Library —— 图书馆
     *       - Volume
     *     requestBody:
     *       required: true
     *       content:
     *         application/json:
     *           schema:
     *             $ref: '#/components/schemas/VolumeCreateRequest'
     *           examples:
     *             default:
     *               $ref: '#/components/examples/VolumeCreateRequestExample'
     *     responses:
     *       200:
     *         description: 分卷创建成功
     *         content:
     *           application/json:
     *             schema:
     *               $ref: '#/components/schemas/ApiSuccessResponse'
     *       600:
     *         description: 请求参数错误（如 bookId 非数字、缺少必填字段）
     *         content:
     *           application/json:
     *             schema:
     *               $ref: '#/components/schemas/ApiErrorResponse'
     *             example:
     *               code: 60000
     *               msg: "bookId 必须为有效整数"
     *               timestamp: "2026-08-20T10:00:00.000Z"
     *       404:
     *         description: 指定的图书不存在
     *         content:
     *           application/json:
     *             schema:
     *               $ref: '#/components/schemas/ApiErrorResponse'
     *             example:
     *               code: 40400
     *               msg: "未找到该图书"
     *               timestamp: "2026-08-20T10:00:00.000Z"
     *       500:
     *         description: 服务器内部错误
     */
    async createVolume(ctx) {
        const { bookId, title, introduction } = ctx.request.body;
        ctx.body = await this.#volumeCommandService.createVolume(bookId, title, introduction);
    }

    /**
     * @swagger
     * /library/book/volume:
     *   put:
     *     summary: 【卷】更新分卷信息
     *     description: 根据分卷 ID 更新标题或简介（统一包装格式）
     *     tags:
     *       - Library —— 图书馆
     *       - Volume
     *     requestBody:
     *       required: true
     *       content:
     *         application/json:
     *           schema:
     *             $ref: '#/components/schemas/UpdateVolumeRequest'
     *           examples:
     *             full:
     *               $ref: '#/components/examples/UpdateVolumeRequestExample'
     *             partial:
     *               $ref: '#/components/examples/UpdateVolumeRequestPartial'
     *     responses:
     *       200:
     *         description: 更新成功
     *         content:
     *           application/json:
     *             schema:
     *               $ref: '#/components/schemas/ApiSuccessResponse'
     *             example:
     *               code: 20000
     *               msg: "success"
     *               timestamp: "2026-08-22T10:00:00.000Z"
     *       400:
     *         description: 请求参数错误（如 volumeId 缺失或非数字）
     *         content:
     *           application/json:
     *             schema:
     *               $ref: '#/components/schemas/ApiErrorResponse'
     *             example:
     *               code: 40000
     *               msg: "volumeId 必须为有效整数"
     *               timestamp: "2026-08-22T10:00:00.000Z"
     *       404:
     *         description: 分卷不存在
     *         content:
     *           application/json:
     *             schema:
     *               $ref: '#/components/schemas/ApiErrorResponse'
     *             example:
     *               code: 40400
     *               msg: "未找到该分卷"
     *               timestamp: "2026-08-22T10:00:00.000Z"
     *       500:
     *         description: 服务器内部错误
     */
    async updateVolume(ctx) {
        const { volumeId, title, introduction } = ctx.request.body;
        if (isNaN(volumeId)) throw new UserInputError("volumeId 必须为有效整数");
        ctx.body = await this.#volumeCommandService.updateVolume(volumeId, title, introduction);
    }

    /**
     * @swagger
     * /library/book/volume:
     *   delete:
     *     summary: 【卷】删除图书分卷
     *     description: 根据分卷 ID 删除指定的分卷及其关联数据（如章节）（统一包装格式）
     *     tags:
     *       - Library —— 图书馆
     *       - Volume
     *     parameters:
     *       - in: query
     *         name: volumeId
     *         schema:
     *           type: integer
     *           minimum: 1
     *         required: true
     *         description: 要删除的分卷 ID
     *         example: 52
     *     responses:
     *       200:
     *         description: 删除成功
     *         content:
     *           application/json:
     *             schema:
     *               $ref: '#/components/schemas/ApiSuccessResponse'
     *       600:
     *         description: 参数错误（如 volumeId 缺失或非数字）
     *         content:
     *           application/json:
     *             schema:
     *               $ref: '#/components/schemas/ApiErrorResponse'
     *             example:
     *               code: 60000
     *               msg: "无效的卷ID"
     *               timestamp: "2026-08-21T12:00:00.000Z"
     *       404:
     *         description: 分卷不存在
     *         content:
     *           application/json:
     *             schema:
     *               $ref: '#/components/schemas/ApiErrorResponse'
     *             example:
     *               code: 40400
     *               msg: "未找到该分卷"
     *               timestamp: "2026-08-21T12:00:00.000Z"
     *       500:
     *         description: 服务器内部错误
     */
    async deleteVolume(ctx) {
        const volumeId = ctx.query.volumeId * 1;
        if (isNaN(volumeId)) throw new UserInputError("无效的卷ID");
        ctx.body = await this.#volumeCommandService.deleteVolume(volumeId);
    }
}