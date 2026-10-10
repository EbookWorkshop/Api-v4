import { StorageRepository } from '../../4-infrastructure/repositories/StorageRepository.js';

export class StorageService {
    /** @type {StorageRepository} */
    #storageRepository;

    /**
     * @param {StorageRepository} storageRepository 
     */
    constructor(storageRepository) {
        this.#storageRepository = storageRepository;
    }

    async getLastPage() {
        const p = await this.#storageRepository.findLastPage();
        return p?.LastPage;
    }

    async listHosts() {
        return this.#storageRepository.listHosts();
    }

    /**
     * 分页获取数据
     * @param {*} options 
     * @returns 
     */
    async findBookWithPagging(options = {}) {
        return this.#storageRepository.findBookWithPagging(options);
    }

    async findExistSource(source) {
        return this.#storageRepository.findExistSource(source);
    }
    async findOneMissingCover() {
        return this.#storageRepository.findOneMissingCover();
    }

    async findFrequentCovers(threshold = 5) {
        return this.#storageRepository.findFrequentCovers(threshold);
    }

    /** 更新  */

    /**
     * 
     * @param {*} page 
     * @param {*} host 
     */
    async updateLastPage(page, host) {
        return this.#storageRepository.updateLastPage(page, host);
    }
    async deleteLastPage(host) {
        return this.#storageRepository.deleteLastPage(host);
    }

    async bulkCreate(books, transaction) {
        return this.#storageRepository.bulkCreate(books, transaction);
    }
    async updateCover(id, coverImage) {
        return this.#storageRepository.updateCover(id, coverImage);
    }
}