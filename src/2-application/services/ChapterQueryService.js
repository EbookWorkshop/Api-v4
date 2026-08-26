
import { ChapterRepository } from '../../4-infrastructure/repositories/ChapterRepository.js';
import { AppError } from "../../5-shared/errors/index.js"

export class ChapterQueryService {
    /** @type {ChapterRepository} */
    #chapterRepository;

    /**
     * @param {ChapterRepository} chapterRepository 
     */
    constructor(chapterRepository) {
        this.#chapterRepository = chapterRepository;
    }

    /**
     * 找到具体章节
     * @param {number} chapterId 
     * @returns 
     */
    async getChapterById(chapterId) {
        const cpt = await this.#chapterRepository.findByPkWithEbook(chapterId);
        if (!cpt) throw new AppError('章节不存在', 404);
        const { Ebook: book, ...chapter } = cpt;
        return {
            Book: { "FontFamily": "", ...book },//TODO:修复FontFamily的耦合
            ...chapter
        }
    }

    /**
     * 找到相邻章节
     * @param {*} chapterid 
     */
    async getAdjacentChapter(chapterid) {
        const currentEntity = await this.#chapterRepository.findByPK(chapterid);
        if (!currentEntity) throw new AppError("章节并不存在：" + chapterid, 404);

        const [prevEntity, nextEntity] = await Promise.all([
            this.#chapterRepository.findPrevious(currentEntity.BookId, currentEntity.OrderNum),
            this.#chapterRepository.findNext(currentEntity.BookId, currentEntity.OrderNum),
        ]);

        return {
            pre: { id: prevEntity?.id },
            next: { id: nextEntity?.id }
        }
    }

    /**
     * 搜索章节内容
     * @param {String} keyword 查询关键字
     * @param {Object} [option] - 可选参数（允许为空）
     * @param {("title"|"content")} [option.type] - 搜索类型，`title` 或 `content`
     * @param {number[]} [option.bookId] - 仅查询范围的书籍 ID 数组，允许为空
     * @param {number[]} [option.notFind] - 排除的书籍 ID 数组，允许为空
     * @returns 
     */
    async searchChapters(keyword, option) {
        const result = await this.#chapterRepository.searchChapters(keyword, option);
        return result;
    }

    /**
     * 列出本书的隐藏章节
     * @param {*} bookId 
     */
    async listHiddenChapters(bookId) {
        return await this.#chapterRepository.listHiddenChapters(bookId);
    }

    /**
     * 
     * @param {number} bookId 
     * @param {Array<number>} volumeIds 
     */
    async listChaptersByVolumes(bookId, volumeIds) {
        return this.#chapterRepository.findChaptersByVolumes(bookId, volumeIds);
    }

    /**
     * 通过ID 查找章节信息
     * @param {*} bookId 
     * @param {*} chapterIds 
     * @returns 
     */
    async listChaptersByIds(bookId, chapterIds) {
        return this.#chapterRepository.findChaptersByIds(bookId, chapterIds);
    }

    /**
     * 找到书记所有章节
     * @param {*} bookId 
     * @returns 
     */
    async listChaptersByBook(bookId) {
        return this.#chapterRepository.findChaptersByBookId(bookId);
    }

    /**
     * 获取简介章节
     * @param {*} bookId 
     * @returns 
     */
    async getIntroduction(bookId) {
        return this.#chapterRepository.findIntroduction(bookId);
    }
}
