import { ReviewDictionaryRepository } from '../../4-infrastructure/repositories/ReviewDictionaryRepository.js';
import { AppError, UserInputError } from "../../5-shared/errors/index.js"

export class ReviewDictionaryService {
    /** @type {ReviewDictionaryRepository} */
    #reviewDictionaryRepository;

    /**
     * @param {ReviewDictionaryRepository} reviewDictionaryRepository 
     */
    constructor(reviewDictionaryRepository) {
        this.#reviewDictionaryRepository = reviewDictionaryRepository;
    }

    /**
     * 
     * @param {*} host url/host
     * @returns 
     */
    async getDictionaryByURL(host) {
        return this.#reviewDictionaryRepository.findByHost(host);
    }


    async saveDictionaries(host, data, options) {
        return this.#reviewDictionaryRepository.batchUpsert(host, data, options);
    }

    async deleteDictionaries(host, options) {
        return this.#reviewDictionaryRepository.deleteByHost(host, options);
    }
}