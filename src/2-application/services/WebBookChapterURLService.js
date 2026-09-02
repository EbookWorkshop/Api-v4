import { WebBookChapterURLRepository } from '../../4-infrastructure/repositories/WebBookChapterURLRepository.js';
import { getHost } from "../../5-shared/utils/site.js";
import { AppError, UserInputError } from "../../5-shared/errors/index.js"

export class WebBookChapterURLService {
    /** @type {WebBookChapterURLRepository} */
    #webBookChapterURLRepository;
    #webBookQueryService;

    /**
     * @param {WebBookChapterURLRepository} webBookChapterURLRepository 
     */
    constructor(webBookChapterURLRepository, webBookQueryService) {
        this.#webBookChapterURLRepository = webBookChapterURLRepository;
        this.#webBookQueryService = webBookQueryService;
    }

    /**
     * 获取章节所有网址
     * @param {*} chapterId 
     * @returns 
     */
    async getChapterSources(chapterId) {
        return this.#webBookChapterURLRepository.queryURLByChapterId(chapterId);
    }

    /**
     * 获得章节的默认网址
     * @param {number} chapterId 
     * @param {number} bookId 
     */
    async getDefaultChapterSource(chapterId, bookId) {
        let defBookSource = "";
        if (bookId) {
            const sourceInfo = await this.#webBookQueryService.getDefSources(bookId);
            defBookSource = sourceInfo.Path;
        }
        else {   /* 通过 chapterId 反推出book信息并推导到当前来源 */ }

        const defHost = getHost(defBookSource);
        const chapterList = await this.getChapterSources(chapterId);
        return chapterList.find(chap => chap.Path?.includes(defHost));
    }

    /**
     * 根据记录ID更新章节来源网址
     * @param {*} id 
     * @param {*} url 
     * @returns 
     */
    async upsertChapterSource(id, url) {
        return this.#webBookChapterURLRepository.updateSourcePath(id, url);
    }
}