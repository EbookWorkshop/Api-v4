import { RuleForWebRepository } from '../../4-infrastructure/repositories/RuleForWebRepository.js';
import { AppError, UserInputError } from "../../5-shared/errors/index.js"

export class RuleForWebQueryService {
    /** @type {RuleForWebRepository} */
    #ruleForWebRepository;

    /**
     * @param {RuleForWebRepository} ruleForWebRepository 
     */
    constructor(ruleForWebRepository) {
        this.#ruleForWebRepository = ruleForWebRepository;
    }

    /**
     * 获取站点列表
     * @returns 
     */
    async getHostList() {
        return await this.#ruleForWebRepository.getHostList();
    }

}