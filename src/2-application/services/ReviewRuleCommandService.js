import { ReviewRuleRepository } from '../../4-infrastructure/repositories/ReviewRuleRepository.js';
import { AppError } from "../../5-shared/errors/AppError.js"

export class ReviewRuleCommandService {
    /** @type {ReviewRuleRepository} */
    #reviewRuleRepository;

    /**
     * @param {ReviewRuleRepository} reviewRuleRepository 
     */
    constructor(reviewRuleRepository) {
        this.#reviewRuleRepository = reviewRuleRepository;
    }

    /**
     * 新增或创建校阅规则
     * @param {*} rule 
     * @returns 
     */
    async createOrUpdateReviewRule(rule) {
        const { id, ...rest } = rule;
        const formaxRule = {
            ...(id ? { id: id * 1 } : {}),
            Name: rest.name,
            Replace: rest.replace,
            Rule: rest.rule,
            bookId: rest.bookId,
        }
        try {
            return await this.#reviewRuleRepository.createOrUpdateReviewRule(formaxRule);
        } catch (err) {
            if (err.name == "SequelizeForeignKeyConstraintError") throw new AppError("添加到关联书本失败：指定ID的书籍不存在。", 600);
            throw new AppError(err.message, 500);
        }
    }

    /**
     * 根据ID删除规则
     * @param {number} id 
     * @returns 
     */
    async deleteReviewRuleById(id) {
        return await this.#reviewRuleRepository.deleteReviewRuleById(id);
    }
}