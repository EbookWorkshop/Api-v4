import { ReviewRuleRepository } from '../../4-infrastructure/repositories/ReviewRuleRepository.js';
import { AppError } from "../../5-shared/errors/AppError.js"

export class ReviewRuleQueryService {
    /** @type {ReviewRuleRepository} */
    #reviewRuleRepository;

    /**
     * @param {ReviewRuleRepository} reviewRuleRepository 
     */
    constructor(reviewRuleRepository) {
        this.#reviewRuleRepository = reviewRuleRepository;
    }

    async findAll() {
        return await this.#reviewRuleRepository.findAll();
    }
}