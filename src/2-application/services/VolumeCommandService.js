import { VolumeRepository } from '../../4-infrastructure/repositories/VolumeRepository.js';
import { AppError } from "../../5-shared/errors/index.js"

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
     * @param {Number} bookId 
     * @param {String} title 
     * @param {String?} introduction 
     */
    async createVolume(bookId, title, introduction) {
        return await this.#volumeRepository.createVolume(bookId, title, introduction);
    }
}