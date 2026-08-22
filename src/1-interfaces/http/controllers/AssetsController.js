
import { AssetsQueryService } from "../../../2-application/services/AssetsQueryService.js";
// import { AssetsCommandService } from "../../../2-application/services/AssetsCommandService.js";

export class AssetsController {
    #assetsQueryService;
    #assetsCommandService;
    /**
     * @param {AssetsQueryService} assetsQueryService 
     * @param {AssetsCommandService} assetsCommandService 
     */
    constructor(assetsQueryService, assetsCommandService) {
        this.#assetsQueryService = assetsQueryService;
        this.#assetsCommandService = assetsCommandService;
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
        ctx.body = await this.#assetsQueryService.listArchiveBooks();
    }

}