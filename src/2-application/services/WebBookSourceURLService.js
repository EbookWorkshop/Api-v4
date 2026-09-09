import { WebBookSourceURLRepository } from '../../4-infrastructure/repositories/WebBookSourceURLRepository.js';
import { AppError, UserInputError } from "../../5-shared/errors/index.js"

export class WebBookSourceURLService {
    /** @type {WebBookSourceURLRepository} */
    #webBookSourceURLRepository;
    #webBookChapterURLRepository;
    #WebBookRepository;
    #transaction;

    /**
     * @param {WebBookSourceURLRepository} webBookSourceURLRepository 
     */
    constructor(webBookSourceURLRepository, webBookChapterURLRepository, WebBookRepository, transaction) {
        this.#webBookSourceURLRepository = webBookSourceURLRepository;
        this.#webBookChapterURLRepository = webBookChapterURLRepository;
        this.#WebBookRepository = WebBookRepository;
        this.#transaction = transaction;
    }

    /**
     * 修改域名/全库修改
     * TODO: 这个方法可能有值得优化的地方
     */
    async changeHostname(host, newHost) {
        return this.#transaction.runInTransaction(async (transaction) => {
            const allChanged = await this.#webBookSourceURLRepository.findByHostWithBookInfo(host);
            await this.#webBookSourceURLRepository.changeHosts(host, newHost, { transaction });
            await this.#webBookChapterURLRepository.changeHosts(host, newHost, { transaction });
            return allChanged.map(w => ({
                BookId: w['WebBook.Ebook.id'],
                BookName: w['WebBook.Ebook.BookName'],
            }));
        });
    }

    async addSource(bookId, sourceURL, type = "index", setDefault = true) {
        return this.#transaction.runInTransaction(async (transaction) => {
            const myWebbook = await this.#WebBookRepository.findByBookId(bookId);

            const result = await this.#webBookSourceURLRepository.add({
                Path: sourceURL,
                WebBookId: myWebbook.id,
                Type: type,
            }, { transaction });

            if (setDefault) {
                await this.#WebBookRepository.update(bookId, { defaultIndex: result.id }, { transaction });
            }

            return result;
        });
    }
}