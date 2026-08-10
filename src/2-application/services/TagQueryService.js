import { TagRepository } from "../../4-infrastructure/repositories/TagRepository";

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
     * @param {boolean} hasBook 标签是否含书
     * @returns 
     */
    async getTagList(hasBook) {
        const data = await this.#tagRepository.findAll(hasBook, hasBook);
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
}
