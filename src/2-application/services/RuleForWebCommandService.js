import { RuleForWebRepository } from '../../4-infrastructure/repositories/RuleForWebRepository.js';
import { AppError } from "../../5-shared/errors/index.js"

export class RuleForWebCommandService {
    /** @type {RuleForWebRepository} */
    #ruleForWebRepository;

    /**
     * @param {RuleForWebRepository} ruleForWebRepository 
     */
    constructor(ruleForWebRepository) {
        this.#ruleForWebRepository = ruleForWebRepository;
    }

}