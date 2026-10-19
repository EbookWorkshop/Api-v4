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
        return p?.LastPage ?? null;
    }

    async listHosts() {
        return this.#storageRepository.listHosts();
    }

    async search({ text, type, host }) {
        return this.#storageRepository.search({ text, type, host });
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

    async findFrequentCovers(threshold = 5) {
        return this.#storageRepository.findFrequentCovers(threshold);
    }

    async findOneNeedingCoverCache(threshold = 3) {
        return this.#storageRepository.findOneNeedingCoverCache(threshold);
    }

    /**
     * 统计库存情况
     */
    async getStats() {
        // const getSto this.#storageRepository
        const storageStep = await this.#storageRepository.listStorageStep();
        const hostStats = await this.#storageRepository.getHostStats();

        return { step: storageStep, hostStats };
    }

    /** 更新  */
    async findOneMissingCover() {
        const nextCover = await this.#storageRepository.findOneMissingCover();
        if (!nextCover) {
            const rrrn = await this.#storageRepository.restartCover();
            console.log("pending 回收", rrrn);
        }
        else
            await this.#storageRepository.updateCover(nextCover.id, "pending");
        return nextCover;
    }

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