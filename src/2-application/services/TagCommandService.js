import { TagRepository } from '../../4-infrastructure/repositories/TagRepository.js';
import { AppError } from "../../5-shared/errors/AppError.js"

export class TagCommandService {
    /** @type {TagRepository} */
    #tagRepository;

    /**
     * @param {TagRepository} tagRepository 
     */
    constructor(tagRepository) {
        this.#tagRepository = tagRepository;
    }

    /**
     * 创建一个标签
     * @param {string} tagText 标签文本
     * @param {string|null|undefined} color 标签背景色
     * @param {number} bookId 直接关联书本
     * @returns [isCreateTag,isAddToBook] 是否创建标签，是否关联书籍
     */
    async createTag(tagText, color, bookId) {
        return await this.#tagRepository.createTag(tagText, color, bookId);
    }

    /**
     * 删除某标签
     * @param {number} tagId 要删除的标签ID
     */
    async deleteTag(tagId) {
        return await this.#tagRepository.deleteTag(tagId);
    }

    /**
     * 修改标签信息
     * @param {number} tagId 标签ID
     * @param {*} tagText 标签文本
     * @param {*} color 标签颜色
     * @returns 修改行数
     */
    async updateTag(tagId, tagText, color){
        return await this.#tagRepository.updateTag(tagId, tagText, color)
    }
}