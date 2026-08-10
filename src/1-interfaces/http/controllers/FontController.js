export class FontController {
    #fontService;

    constructor(fontService) {
        this.#fontService = fontService;
    }

    /**
     * @swagger
     * /services/font/UI:
     *   get:
     *     summary: 获取所有标签
     *     Fonts: [Fonts]
     *     responses:
     *       200:
     *         description: 成功
     *         content:
     *           application/json:
     *             schema:
     *               $ref: '#/components/schemas/FontListResponse'
     */
    async getUIFont(ctx) {
        ctx.body = await this.#fontService.getUIFont();
    }

}
