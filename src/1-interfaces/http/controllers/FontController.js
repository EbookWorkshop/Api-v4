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

}
