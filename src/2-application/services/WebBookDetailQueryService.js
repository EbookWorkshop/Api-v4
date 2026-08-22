import { WebBookRepository } from "../../4-infrastructure/repositories/WebBookRepository.js";
import { AppError } from "../../5-shared/errors/index.js"

export class WebBookDetailQueryService {
    #bookDetailQueryService;
    #webBookRepo;


    /**
     * @param {WebBookRepository} webBookRepo 
     * @param {*} bookDetailQueryService 
     */
    constructor(webBookRepo, bookDetailQueryService) {
        this.#webBookRepo = webBookRepo;
        this.#bookDetailQueryService = bookDetailQueryService;
    }

    /**
     * 获取书籍基本信息
     * @param {*} bookId 
     * @returns 
     */
    async getBookDetail(bookId) {
        const webook = await this.#webBookRepo.findByBookId(bookId);
        if (!webook) {
            throw new AppError('该书籍非网文类型', 404);
        }
        const baseData = await this.#bookDetailQueryService.getBookDetail(bookId);

        const { id: webBookId, ...webookWithoutId } = webook;

        return {
            ...baseData,
            ...webookWithoutId,
            WebBookId: webBookId,   // 显式映射为接口约定的 WebBookId
        };
    }

    /**
     * 找到书的元数据
     * @param {*} bookId 
     * @returns 
     */
    async getMetadata(bookId) {
        return this.#bookDetailQueryService.getMetadata(bookId);
    }
}