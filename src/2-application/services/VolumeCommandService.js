import { VolumeRepository } from '../../4-infrastructure/repositories/VolumeRepository.js';
// import { AppError } from "../../5-shared/errors/index.js"

export class VolumeCommandService {
    /** @type {VolumeRepository} */
    #volumeRepository;

    /**
     * @param {VolumeRepository} volumeRepository 
     */
    constructor(volumeRepository) {
        this.#volumeRepository = volumeRepository;
    }

    /**
     * 创建一个新卷
     * @param {object} book 
     * @param {number} book.bookId 
     * @param {string} book.title 
     * @param {string?} book.introduction 
     */
    async createVolume({ bookId, title, introduction }) {
        return this.#volumeRepository.createVolume({ bookId, title, introduction });
    }

    /**
     * 更新一个新卷
     * @param {object} volume 
     * @param {number} volume.volumeId 
     * @param {string} volume.title 
     * @param {string?} volume.introduction 
     */
    async updateVolume({ volumeId, title, introduction }) {
        return this.#volumeRepository.updateVolume({ volumeId, title, introduction });
    }

    /**
     * 更新卷排序
     * @param {*} volumeOrders 
     * @returns 
     */
    async reorderVolumes(volumeOrders) {
        return this.#volumeRepository.reorderVolumes(volumeOrders);
    }

    /**
     * 删除一个卷
     * # 并释放卷中所有章节
     * @param {number} volumeId 
     * @returns 
     */
    async deleteVolume(volumeId) {
        return this.#volumeRepository.deleteVolume(volumeId);
    }
}