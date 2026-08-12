export class FontController {
    #fontService;

    constructor(fontService) {
        this.#fontService = fontService;
    }

    async getUIFont(ctx) {
        ctx.body = await this.#fontService.getUIFont();
    }

}
