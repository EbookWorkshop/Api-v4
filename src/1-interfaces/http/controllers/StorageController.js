
import { StorageService } from "../../../2-application/services/StorageService.js";
import { UserInputError } from "../../../5-shared/errors/UserInputError.js";
// import { AppError, UserInputError } from '../../../5-shared/errors/index.js';

export class StorageController {
    #storageService;
    /**
     * @param {StorageService} storageService 
     */
    constructor(storageService) {
        this.#storageService = storageService;
    }

    /**
     * @swagger
     * /library/storage/list:
     *   get:
     *     summary: 获取存储库图书列表
     *     description: 分页查询存储库中的图书信息（统一包装格式）
     *     tags:
     *       - Library —— 图书馆
     *       - Storage
     *     parameters:
     *       - in: query
     *         name: limit
     *         schema:
     *           type: integer
     *           minimum: 1
     *           default: 20
     *         required: false
     *         description: 每页返回的记录数
     *         example: 20
     *       - in: query
     *         name: offset
     *         schema:
     *           type: integer
     *           minimum: 0
     *           default: 0
     *         required: false
     *         description: 跳过的记录数（用于分页）
     *         example: 0
     *       - in: query
     *         name: host
     *         schema:
     *           type: string
     *           default: null
     *         required: false
     *         description: 按来源网站过滤
     *         example: www.abc.com
     *       - in: query
     *         name: author
     *         schema:
     *           type: string
     *           default: null
     *         required: false
     *         description: 按来作者过滤
     *         example: 鲁迅
     *     responses:
     *       200:
     *         description: 成功返回图书列表
     *         content:
     *           application/json:
     *             schema:
     *               $ref: '#/components/schemas/StorageBookListResponse'
     *             examples:
     *               success:
     *                 $ref: '#/components/examples/StorageBookListSuccess'
     *               empty:
     *                 $ref: '#/components/examples/StorageBookListEmpty'
     *       400:
     *         description: 参数错误（如 limit 或 offset 非数字）
     *         content:
     *           application/json:
     *             schema:
     *               $ref: '#/components/schemas/ApiErrorResponse'
     *             example:
     *               code: 60000
     *               msg: "limit 和 offset 必须为有效整数"
     *               timestamp: "2026-10-07T10:00:00.000Z"
     *       500:
     *         description: 服务器内部错误
     */
    async list(ctx) {
        let { limit = 20, offset = 0, host, author } = ctx.query;
        limit *= 1;
        offset *= 1;
        if (isNaN(limit) || isNaN(offset)) throw new UserInputError("limit 和 offset 必须为有效整数");
        ctx.body = await this.#storageService.findBookWithPagging({ limit, offset, host: host?.split(","), author });
    }

    /**
     * @swagger
     * /library/storage/host:
     *   get:
     *     summary: 获取存储库来源网站列表
     *     description: 返回 Storage 表中出现过的 Host 去重列表（统一包装格式）
     *     tags:
     *       - Library —— 图书馆
     *       - Storage
     *     responses:
     *       200:
     *         description: 成功返回主机名列表
     *         content:
     *           application/json:
     *             schema:
     *               allOf:
     *                 - $ref: '#/components/schemas/ApiResponse'
     *                 - type: object
     *                   properties:
     *                     data:
     *                       type: array
     *                       items:
     *                         type: string
     *             example:
     *               code: 20000
     *               msg: "success"
     *               timestamp: "2026-10-13T10:00:00.000Z"
     *               data: ["www.example.com", "www.test.org"]
     *       500:
     *         description: 服务器内部错误
     */
    async listHosts(ctx) {
        ctx.body = await this.#storageService.listHosts();
    }

    /**
     * @swagger
     * /library/storage/search:
     *   post:
     *     summary: 搜索存储库图书
     *     description: 按关键字、类型、来源网站搜索 Storage 中的图书（统一包装格式）
     *     tags:
     *       - Library —— 图书馆
     *       - Storage
     *     requestBody:
     *       required: true
     *       content:
     *         application/json:
     *           schema:
     *             type: object
     *             properties:
     *               text:
     *                 type: string
     *                 description: 搜索关键字，多个关键字可用空格分隔
     *                 example: "福尔摩斯"
     *               type:
     *                 type: string
     *                 enum: ["不限", "书名", "作者"]
     *                 example: "不限"
     *               host:
     *                 type: string
     *                 example: "www.example.com"
     *             required:
     *               - text
     *     responses:
     *       200:
     *         description: 搜索成功，返回匹配的图书列表
     *         content:
     *           application/json:
     *             schema:
     *               $ref: '#/components/schemas/StorageBookListResponse'
     *       600:
     *         description: 参数错误（text 缺失）
     *       500:
     *         description: 服务器内部错误
     */
    async search(ctx) {
        const { text, type, host } = ctx.request.body;
        if (!text) throw new UserInputError("查找条件不能为空");
        ctx.body = await this.#storageService.search({ text, type, host });
    }
}