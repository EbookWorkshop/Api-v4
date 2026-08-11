
import { ChapterRepository } from '../../4-infrastructure/repositories/ChapterRepository.js';

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
     * @param {*} chapterId 
     * @returns 
     */
    async getChapterById(chapterId) {
        const cpt = await this.#chapterRepository.findByPkWithEbook(chapterId);
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

        const [prevEntity, nextEntity] = await Promise.all([
            this.#chapterRepository.findPrevious(currentEntity.BookId, currentEntity.OrderNum),
            this.#chapterRepository.findNext(currentEntity.BookId, currentEntity.OrderNum),
        ]);

        return {
            pre: { id: prevEntity.id },
            next: { id: nextEntity.id }
        }
    }

}
