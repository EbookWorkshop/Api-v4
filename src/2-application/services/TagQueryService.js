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
     * @param {boolean} hasBook 标签是否含书本的引用次数
     * @returns 
     */
    async getTagList(hasBook) {
        const data = await this.#tagRepository.findAll(true, hasBook);
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
