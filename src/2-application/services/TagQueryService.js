import { TagRepository } from "../../4-infrastructure/repositories/TagRepository.js";

export class TagQueryService {
    /** @type {TagRepository} */
    #tagRepository;

    /**
     * @param {TagRepository} tagRepository 仓库
     */
    constructor(tagRepository) {
        this.#tagRepository = tagRepository;
    }

    /**
     * 获取标签列表
     * @param {boolean} hasBook 标签是否返回至少有一本书引用的
     * @returns 
     */
    async listTags(hasBook) {
        const data = await this.#tagRepository.findAllWithBooks(true, hasBook);
        let result = data.map((t) => {
            return {
                id: t.id,
                Text: t.Text,
                Color: t.Color,
                Count: t.EBookTags.length
            };
        });
        result.sort((a, b) => b.Count - a.Count);
        return result;
    }

    /**
     * 
     * @param {*}bookId 
     */
    async getEbookTags(bookId) {
        return await this.#tagRepository.findTagForBook(bookId);
    }
}
