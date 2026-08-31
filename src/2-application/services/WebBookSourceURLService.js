import { WebBookSourceURLRepository } from '../../4-infrastructure/repositories/WebBookSourceURLRepository.js';
import { AppError, UserInputError } from "../../5-shared/errors/index.js"

export class WebBookSourceURLService {
    /** @type {WebBookSourceURLRepository} */
    #webBookSourceURLRepository;
    #webBookChapterURLRepository;
    #transaction;

    /**
     * @param {WebBookSourceURLRepository} webBookSourceURLRepository 
     */
    constructor(webBookSourceURLRepository, webBookChapterURLRepository, transaction) {
        this.#webBookSourceURLRepository = webBookSourceURLRepository;
        this.#webBookChapterURLRepository = webBookChapterURLRepository;
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
}