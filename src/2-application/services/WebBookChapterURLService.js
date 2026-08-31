import { WebBookChapterURLRepository } from '../../4-infrastructure/repositories/WebBookChapterURLRepository.js';
import { AppError, UserInputError } from "../../5-shared/errors/index.js"

export class WebBookChapterURLService {
    /** @type {WebBookChapterURLRepository} */
    #webBookChapterURLRepository;

    /**
     * @param {WebBookChapterURLRepository} webBookChapterURLRepository 
     */
    constructor(webBookChapterURLRepository) {
        this.#webBookChapterURLRepository = webBookChapterURLRepository;
    }

    async getChapterSources(chapterId) {
        return this.#webBookChapterURLRepository.queryURLByChapterId(chapterId);
    }
}