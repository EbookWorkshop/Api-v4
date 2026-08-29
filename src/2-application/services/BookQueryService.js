import { EbookRepository } from '../../4-infrastructure/repositories/EbookRepository.js';

export class BookQueryService {
    /** @type {EbookRepository} */
    #ebookRepository;

    /**
     * @param {EbookRepository} ebookRepository 
     */
    constructor(ebookRepository) {
        this.#ebookRepository = ebookRepository;
    }

    /**
     * 查找书本列表
     * @param {number?} tagId 包含的tagId
     * @param {number[]?} excludeTagIds 排除的tags
     * @returns 
     */
    async listBooks({ tagId, excludeTagIds }) {
        const bookList = await this.#ebookRepository.findAllWithTagFilter({
            tagId,
            excludeTagIds,
            orderBy: [['Hotness', 'DESC'], ['id', 'DESC']],
        });
        return bookList.map(({ id, ...book }) => ({ BookId: id, ...book }));
    }

    /**
     * 找到书籍
     * @param {number} bookId 
     * @returns 
     */
    async getBook(bookId) {
        return this.#ebookRepository.findById(bookId);
    }

}
