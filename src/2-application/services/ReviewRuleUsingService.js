import { ReviewRuleUsingRepository } from '../../4-infrastructure/repositories/ReviewRuleUsingRepository.js';
import { AppError, UserInputError } from "../../5-shared/errors/index.js"

export class ReviewRuleUsingService {
    /** @type {ReviewRuleUsingRepository} */
    #reviewRuleUsingRepository;

    /**
     * @param {ReviewRuleUsingRepository} reviewRuleUsingRepository 
     */
    constructor(reviewRuleUsingRepository) {
        this.#reviewRuleUsingRepository = reviewRuleUsingRepository;
    }

    async list() {
        return this.#reviewRuleUsingRepository.findAll();
    }

    async getByBookId(bookId) {
        return this.#reviewRuleUsingRepository.findAll(bookId);
    }

    async addBookRule(bookId, ruleId) {
        return this.#reviewRuleUsingRepository.create(bookId, ruleId);
    }
    async deleteBookRule(id) {
        return this.#reviewRuleUsingRepository.delete(id);
    }
}