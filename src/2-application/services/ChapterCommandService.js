import { ChapterRepository } from '../../4-infrastructure/repositories/ChapterRepository.js';
import { AppError } from "../../5-shared/errors/index.js"

export class ChapterCommandService {
    /** @type {ChapterRepository} */
    #chapterRepository;

    /**
     * @param {ChapterRepository} chapterRepository 
     */
    constructor(chapterRepository) {
        this.#chapterRepository = chapterRepository;
    }

    /**
     * 从卷中批量移出章节
     * @param {number[]} chapterIds 章节ID列表
     * @returns 
     */
    async removeChaptersFromVolume(chapterIds) {
        return await this.#chapterRepository.removeChaptersFromVolume(chapterIds);
    }

    /**
     * 插入或更新章节
     * @param {Object} [chapter] 章节信息
     * @param {number} [chapter.IndexId] 章节ID
     * @param {number} [chapter.BookId] 书籍ID
     * @param {string} [chapter.Title] 章节标题     
     * @param {string} [chapter.Content] 章节正文
     * @param {number} [chapter.VolumeId] 卷ID
     * @param {number} [chapter.OrderNum] 章节排序号
     */
    async upsertChapter(chapter) {
        return await this.#chapterRepository.upsertChapter(chapter);
    }

    /**
     * 根据ID删除章节
     * @param {*} chapterId 需要删除的章节
     * @returns 
     */
    async deleteChapter(chapterId) {
        return await this.#chapterRepository.deleteChapter(chapterId);
    }

    /**
     * 批量插入章节
     * @param {number} bookId 将插入的书籍
     * @param {number|undefined} volumeId 插到指定卷中，-1为不设置卷
     * @param {Array<{Content:string,OrderNum:number,Title:string}>} chapters 章节列表
     */
    async batchInsertChapters({ bookId, volumeId, chapters }) {
        return await this.#chapterRepository.batchInsertChapters({ bookId, volumeId, chapters });
    }

    /**
     * 批量更新章节顺序
     * @param {Object} [orderData] 新的排序配置
     * @param {Object} [orderData.indexId] 待更新的章节ID
     * @param {Object} [orderData.newOrder] 要更新到的新序号
     * @returns 
     */
    async updateOrder(orderData) {
        return await this.#chapterRepository.updateOrder(orderData);
    }

    /**
     * 将指定章节设置为简介
     * 并将已有的简介章节放出
     * @param {*} chapterId 章节ID
     * @returns 
     */
    async setAsIntroduction(chapterId) {
        return await this.#chapterRepository.setAsIntroduction(chapterId);
    }
}
