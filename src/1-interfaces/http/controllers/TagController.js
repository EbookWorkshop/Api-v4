export class TagController {
    #TagQueryService;
    #TagCommandService;

    constructor(TagQueryService, TagCommandService) {
        this.#TagQueryService = TagQueryService;
        this.#TagCommandService = TagCommandService;
    }

    /**
     * @swagger
     * /api/Tags:
     *   get:
     *     summary: 获取所有标签
     *     tags: [Tags]
     *     responses:
     *       200:
     *         description: 成功
     *         content:
     *           application/json:
     *             schema:
     *               $ref: '#/components/schemas/TagListResponse'
     */
    async listTags(ctx) {
        const hasbook = ctx.query.hasbook * 1 > 0
        ctx.body = await this.#TagQueryService.getTagList(hasbook);
    }

}
