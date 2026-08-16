import { VolumeRepository } from '../../4-infrastructure/repositories/VolumeRepository.js';
import { AppError } from "../../5-shared/errors/AppError.js"

export class VolumeQueryService {
    /** @type {VolumeRepository} */
    #volumeRepository;

    /**
     * @param {VolumeRepository} volumeRepository 
     */
    constructor(volumeRepository) {
        this.#volumeRepository = volumeRepository;
    }

    /**
     * 找到指定书的卷信息
     * @param {*} bookId 
     * @returns 
     */
    async findByBookId(bookId) {
        return await this.#volumeRepository.findByBookId(bookId);
    }
}