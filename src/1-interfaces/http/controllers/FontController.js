export class FontController {
    #fontService;

    constructor(fontService) {
        this.#fontService = fontService;
    }

    /**
     * @swagger
     * /services/font/UI:
     *   get:
     *     summary: 获取 UI 字体信息
     *     description: 返回当前系统默认 UI 字体的名称和下载链接（统一包装格式）
     *     tags:
     *       - Services - Font —— 系统服务：字体管理
     *       - Font
     *     responses:
     *       200:
     *         description: 成功返回字体信息
     *         content:
     *           application/json:
     *             schema:
     *               $ref: '#/components/schemas/FontUIResponse'
     *             examples:
     *               success:
     *                 $ref: '#/components/examples/FontUISuccess'
     *       500:
     *         description: 服务器内部错误
     */
    async getUIFont(ctx) {
        ctx.body = await this.#fontService.getUIFont();
    }

    /**
     * @swagger
     * /services/font:
     *   get:
     *     summary: 获取字体列表
     *     description: 返回所有可用的字体文件信息（统一包装格式）
     *     tags:
     *       - Services - Font —— 系统服务：字体管理
     *       - Font
     *     responses:
     *       200:
     *         description: 成功返回字体列表
     *         content:
     *           application/json:
     *             schema:
     *               $ref: '#/components/schemas/FontListResponse'
     *             examples:
     *               success:
     *                 $ref: '#/components/examples/FontListSuccess'
     *               empty:
     *                 $ref: '#/components/examples/FontListEmpty'
     *       500:
     *         description: 服务器内部错误
     */
    async getFontList(ctx) {
        ctx.body = await this.#fontService.getFontList();
    }

    /**
     * @swagger
     * /services/font/reading:
     *   get:
     *     summary: 获取阅读字体
     *     description: 返回当前用于阅读的字体名称（统一包装格式）
     *     tags:
     *       - Services - Font —— 系统服务：字体管理
     *       - Font
     *     responses:
     *       200:
     *         description: 成功返回阅读字体名称
     *         content:
     *           application/json:
     *             schema:
     *               $ref: '#/components/schemas/FontReadingResponse'
     *             examples:
     *               success:
     *                 $ref: '#/components/examples/FontReadingSuccess'
     *       500:
     *         description: 服务器内部错误
     */
    async getFontReading(ctx) {
        ctx.body = await this.#fontService.getFontReading();
    }
}
