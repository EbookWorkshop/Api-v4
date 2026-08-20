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
}