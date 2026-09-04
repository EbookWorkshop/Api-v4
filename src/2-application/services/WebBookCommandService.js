import { WebBookRepository } from '../../4-infrastructure/repositories/WebBookRepository.js';
import { AppError } from "../../5-shared/errors/index.js"

export class WebBookCommandService {
    /** @type {WebBookRepository} */
    #webBookRepository;
    /** @type {ITransaction} */
    #transaction;

    /** @type {EbookRepository} */
    #ebookRepository;
    /** @type {ChapterRepository} */
    #chapterRepository;
    #webBookSourceURLRepository;
    #webBookChapterService;

    /**
     * @param {WebBookRepository} webBookRepository 
     */
    constructor(webBookRepository, transaction, ebookRepository, chapterRepository, webBookSourceURLRepository, webBookChapterService) {
        this.#webBookRepository = webBookRepository;
        this.#transaction = transaction;
        this.#ebookRepository = ebookRepository;
        this.#chapterRepository = chapterRepository;
        this.#webBookSourceURLRepository = webBookSourceURLRepository;
        this.#webBookChapterService = webBookChapterService;
    }

    async setAutoSync(bookId, autoSyncEnabled) {
        return this.#webBookRepository.update(bookId, {
            AutoSyncEnabled: autoSyncEnabled
        });
    }

    /**
     * 创建网文书籍
     * @param {*} bookInfo 
     */
    async createBook(bookInfo, setting) {
        return this.#transaction.runInTransaction(async (transaction) => {
            const { ChapterList, Introduction, ...bookDTO } = bookInfo;
            //保存书籍主数据
            const book = await this.#ebookRepository.create(bookDTO, { transaction });
            const bookId = book.id;
            const webBook = await this.#webBookRepository.create({
                WebBookName: bookDTO.BookName,
                BookId: bookId
            }, { transaction });
            await this.#webBookSourceURLRepository.add({
                Path: setting.sourcePage,
                WebBookId: webBook.id,
                Type: "index"
            }, { transaction });
            if (setting.infoPage)
                await this.#webBookSourceURLRepository.add({
                    Path: setting.infoPage,
                    WebBookId: webBook.id,
                    Type: "info"
                }, { transaction });

            //处理章节
            if (Introduction) await this.#chapterRepository.updateIntroduction({ bookId, content: Introduction }, { transaction });

            await this.#webBookChapterService.batchCreate(bookId, ChapterList, { transaction });

            return bookId;
        });
    }
}