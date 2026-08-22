import { IFileScanner } from '../ports/IFileScanner.js';
import { AppError } from "../../5-shared/errors/index.js"

export class AssetsQueryService {
    /** @type {IFileScanner} */
    #fileScanner;
    #config;

    /**
     * @param {IFileScanner} fileScanner 
     */
    constructor(fileScanner, config) {
        this.#fileScanner = fileScanner;
        this.#config = config;
    }

    async listArchiveBooks() {
        return await this.#fileScanner.listFiles(this.#config?.archive?.path, { detail: true }) || [];
    }
}