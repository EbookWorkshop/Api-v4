
import { ChapterRepository } from '../../4-infrastructure/repositories/ChapterRepository.js';
import { AppError } from "../../5-shared/errors/index.js"

export class ChapterQueryService {
    /** @type {ChapterRepository} */
    #chapterRepository;
    #textCleanup;

    /**
     * @param {ChapterRepository} chapterRepository 
     */
    constructor(chapterRepository, textCleanup) {
        this.#chapterRepository = chapterRepository;
        this.#textCleanup = textCleanup;
    }

    /**
     * 找到具体章节
     * @param {number} chapterId 
     * @returns 
     */
    async getChapterById(chapterId) {
        const cpt = await this.#chapterRepository.findByPkWithEbook(chapterId);
        if (!cpt) throw new AppError('章节不存在', 404);
        const { Ebook: book, Volume, } = cpt;

        //注入动态校阅
        return {
            Book: book, VolumeTitle: Volume?.VolumeTitle,
            ...await this.#cleanChapter(book.id, cpt)
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
            ...(prevEntity?.id ? { pre: { id: prevEntity?.id } } : {}),
            ...(nextEntity?.id ? { next: { id: nextEntity?.id } } : {})
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
        let list = await this.#chapterRepository.findChaptersByVolumes(bookId, volumeIds);
        return Promise.all(list.map((chap) => this.#cleanChapter(bookId, chap)));
    }

    /**
     * 通过ID 查找章节信息
     * @param {*} bookId 
     * @param {*} chapterIds 
     * @returns 
     */
    async listChaptersByIds(bookId, chapterIds) {
        let list = await this.#chapterRepository.findChaptersByIds(bookId, chapterIds);
        return Promise.all(list.map((chap) => this.#cleanChapter(bookId, chap)));
    }

    /**
     * 找到书记所有章节
     * @param {*} bookId 
     * @returns 
     */
    async listChaptersByBook(bookId) {
        let list = await this.#chapterRepository.findChaptersByBookId(bookId);
        return Promise.all(list.map((chap) => this.#cleanChapter(bookId, chap)));
    }

    /**
     * 获取简介章节
     * @param {*} bookId 
     * @returns 
     */
    async getIntroduction(bookId) {
        return this.#chapterRepository.findIntroduction(bookId);
    }

    async #cleanChapter(bookId, chapter) {
        const Title = await this.#textCleanup.cleanup(bookId, chapter.Title);
        const Content = await this.#textCleanup.cleanup(bookId, chapter.Content);

        return { ...chapter, Title, Content };
    }
}
