import { WebBookRepository } from '../../4-infrastructure/repositories/WebBookRepository.js';
import { AppError } from "../../5-shared/errors/index.js"

export class WebBookCommandService {
    /** @type {WebBookRepository} */
    #webBookRepository;
    /** @type {ITransaction} */
    #transaction;
    /**
     * @param {WebBookRepository} webBookRepository 
     */
    constructor(webBookRepository, transaction) {
        this.#webBookRepository = webBookRepository;
        this.#transaction = transaction;
    }

    async setAutoSync(bookId, autoSyncEnabled) {
        return this.#webBookRepository.update(bookId, {
            AutoSyncEnabled: autoSyncEnabled
        });
    }
}