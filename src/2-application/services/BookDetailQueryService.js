// 2-application/services/BookDetailQueryService.js
export class BookDetailQueryService {
    constructor(ebookRepo, volumeRepo, indexRepo, chapterRepo) {
        this.ebookRepo = ebookRepo;
        this.indexRepo = indexRepo;
        this.volumeRepo = volumeRepo;
        this.chapterRepo = chapterRepo;
    }

    /**
     * 获取书籍基本信息
     * @param {*} bookId 
     * @returns 
     */
    async getBookDetail(bookId) {
        // 并发查询三个表（充分利用 I/O 并行）
        const [ebook, Index, Volumes, intro] = await Promise.all([
            this.ebookRepo.findById(bookId),
            this.indexRepo.findByBookId(bookId),
            this.volumeRepo.findByBookId(bookId),
            this.chapterRepo.findIntroduction(bookId)
        ]);

        // 组装成 DTO
        return {
            ...ebook.dataValues,
            Introduction: intro.Content,
            Index,
            Volumes,
        };
    }
}