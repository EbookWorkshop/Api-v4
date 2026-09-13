import { ReviewRuleRepository } from '../../4-infrastructure/repositories/ReviewRuleRepository.js';
import { UserInputError } from "../../5-shared/errors/index.js"
import { ReviewString } from "../../5-shared/utils/reviewString.js"

export class ReviewRuleCommandService {
    /** @type {ReviewRuleRepository} */
    #reviewRuleRepository;
    #chapterRepository;

    /**
     * @param {ReviewRuleRepository} reviewRuleRepository 
     */
    constructor(reviewRuleRepository, chapterRepository) {
        this.#reviewRuleRepository = reviewRuleRepository;
        this.#chapterRepository = chapterRepository;
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
            if (err.name == "SequelizeForeignKeyConstraintError") throw new UserInputError("添加到关联书本失败：指定ID的书籍不存在。");
            throw err;
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

    async testRule(ruleId, chapterId) {
        const rule = await this.#reviewRuleRepository.findRules(ruleId);
        const chapter = await this.#chapterRepository.findByPK(chapterId);

        let result = ReviewString.applyRule(rule, chapter.Content);
        return {
            // match,
            source: chapter.Content,
            result
        };
    }
}