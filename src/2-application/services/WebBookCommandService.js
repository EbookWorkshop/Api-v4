import { WebBookRepository } from '../../4-infrastructure/repositories/WebBookRepository.js';

export class WebBookCommandService {
    /** @type {WebBookRepository} */
    #webBookRepository;
    #transaction;
    #ebookRepository;
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
            await this.addSource({ bookId: book.id, defSource: true, url: setting.sourcePage, type: "index" }, transaction, webBook);
            if (setting.infoPage) this.addSource({ bookId: book.id, defSource: false, url: setting.infoPage, type: "info" }, transaction, webBook);

            //处理章节
            if (Introduction) await this.#chapterRepository.updateIntroduction({ bookId, content: Introduction }, { transaction });

            await this.#webBookChapterService.batchCreate(bookId, ChapterList, { transaction });

            return bookId;
        });
    }

    /**
     * 添加网络源
     * @param {*} setting 
     */
    async addSource({ bookId, defSource, url, type }, transaction, webBook) {
        const runInTran = async (transaction) => {
            if (!webBook) webBook = await this.#webBookRepository.findByBookId(bookId);
            if (!webBook) {/* TODO： 新增源相关信息，非网文转网文！ */ }
            const source = await this.#webBookSourceURLRepository.add({
                Path: url,
                WebBookId: webBook.id,
                Type: type
            }, { transaction });

            if (defSource) await this.#webBookRepository.update(bookId, { defaultIndex: source.id }, { transaction });//更新章节ID索引
        }
        if (!transaction) return this.#transaction.runInTransaction(runInTran);
        else return await runInTran(transaction);
    }
}