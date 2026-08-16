
import { VolumeQueryService } from "../../../2-application/services/VolumeQueryService.js";
import { AppError } from '../../../5-shared/errors/AppError.js';

export class VolumeController {
    #volumeQueryService;

    /**
     * @param {VolumeQueryService} volumeQueryService 
     */
    constructor(volumeQueryService) {
        this.#volumeQueryService = volumeQueryService;
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
    async getAllVolumes(ctx) {
        const bookId = ctx.query.bookId * 1;
        if (isNaN(bookId)) throw new AppError("提供的书籍ID不正确。", 600);
        ctx.body = await this.#volumeQueryService.findByBookId(bookId)
    }
}