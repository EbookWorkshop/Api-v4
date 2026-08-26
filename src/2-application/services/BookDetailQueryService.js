import { AppError } from "../../5-shared/errors/index.js"
export class BookDetailQueryService {
    #ebookRepo;
    #indexRepo;
    #volumeRepo;
    #chapterRepo;
    constructor(ebookRepo, volumeRepo, indexRepo, chapterRepo) {
        this.#ebookRepo = ebookRepo;
        this.#indexRepo = indexRepo;
        this.#volumeRepo = volumeRepo;
        this.#chapterRepo = chapterRepo;
    }

    /**
     * 获取书籍基本信息
     * @param {*} bookId 
     * @returns 
     */
    async getBookDetail(bookId) {
        // 并发查询三个表（充分利用 I/O 并行）
        const [ebook, Index, Volumes, intro] = await Promise.all([
            this.#ebookRepo.findById(bookId),
            this.#indexRepo.findByBookId(bookId),
            this.#volumeRepo.findByBookId(bookId),
            this.#chapterRepo.findIntroduction(bookId)
        ]);

        if (!ebook) throw new AppError('书籍不存在', 404);

        // 组装成 DTO
        return {
            ...ebook,
            Introduction: intro?.Content,
            Index,
            Volumes,
        };
    }

    /**
     * 找到书的元数据
     * @param {*} bookId 
     * @returns 
     */
    async getMetadata(bookId) {
        const ebook = await this.#ebookRepo.findById(bookId);
        if (!ebook) throw new AppError('书籍不存在', 404);
        const intro = await this.#chapterRepo.findIntroduction(bookId);
        return {
            ...ebook,
            Introduction: intro?.Content,
        }
    }

}