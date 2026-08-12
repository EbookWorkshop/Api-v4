import { TagQueryService } from "../../../2-application/services/TagQueryService.js";

export class TagController {
    #TagQueryService;
    #TagCommandService;

    /**
     * 
     * @param {TagQueryService} TagQueryService 
     * @param {TagCommandService} TagCommandService 
     */
    constructor(TagQueryService, TagCommandService) {
        this.#TagQueryService = TagQueryService;
        this.#TagCommandService = TagCommandService;
    }

    async listTags(ctx) {
        const hasbook = ctx.query.hasbook * 1 > 0
        ctx.body = await this.#TagQueryService.getTagList(hasbook);
    }

    async ebookTags(ctx) {
        const bookId = ctx.query.bookid * 1;
        ctx.body = await this.#TagQueryService.getEbookTags(bookId);
    }
}
