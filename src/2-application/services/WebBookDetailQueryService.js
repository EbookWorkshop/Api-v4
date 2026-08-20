import { WebBookRepository } from "../../4-infrastructure/repositories/WebBookRepository.js";
import { AppError } from "../../5-shared/errors/index.js"

export class WebBookDetailQueryService {
    #webBookRepo;
    #ebookRepo;
    #indexRepo;
    #volumeRepo;
    #chapterRepo;

    /**
     * 
     * @param {*} ebookRepo 
     * @param {*} volumeRepo 
     * @param {*} indexRepo 
     * @param {*} chapterRepo 
     * @param {WebBookRepository} webBookRepo 
     */
    constructor(ebookRepo, volumeRepo, indexRepo, chapterRepo, webBookRepo) {
        this.#ebookRepo = ebookRepo;
        this.#indexRepo = indexRepo;
        this.#volumeRepo = volumeRepo;
        this.#chapterRepo = chapterRepo;
        this.#webBookRepo = webBookRepo;
    }

    /**
     * 获取书籍基本信息
     * @param {*} bookId 
     * @returns 
     */
    async getBookDetail(bookId) {
        // 并发查询三个表（充分利用 I/O 并行）
        const [ebook, webook, Index, Volumes, intro] = await Promise.all([
            this.#ebookRepo.findById(bookId),
            this.#webBookRepo.findByBookId(bookId),
            this.#indexRepo.findByBookId(bookId),
            this.#volumeRepo.findByBookId(bookId),
            this.#chapterRepo.findIntroduction(bookId),
        ]);

        if (!ebook || !webook) throw new AppError('书籍不存在/该书籍非网文类型', 404);
        // 组装成 DTO
        return {
            ...ebook,
            ...webook,
            Index,
            Volumes,
            Introduction: intro?.Content,
        };
    }

    /**
     * 找到书的元数据
     * @param {*} bookId 
     * @returns 
     */
    async getMetadata(bookId) {
        const ebook = await this.#ebookRepo.findById(bookId);
        const intro = await this.#chapterRepo.findIntroduction(bookId);
        return {
            ...ebook,
            Introduction: intro.Content,
        }
    }
}