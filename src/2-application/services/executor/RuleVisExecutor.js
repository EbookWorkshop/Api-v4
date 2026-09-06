import { ITaskExecutor } from '../../ports/ITaskExecutor.js';
import { RuleEngine, PuppeteerDataFetcher } from '../../../4-infrastructure/fetchers/index.js';
import { RuleForWebVisService } from "../RuleForWebVisService.js"


export class RuleVisExecutor extends ITaskExecutor {
    #config;

    /**
     * 构造函数注入依赖（由子线程内部自行实例化）
     */
    constructor(config) {
        super();
        this.#config = config;
    }

    /**
     * 执行器
     * @param {*} taskType 
     * @param {Object} payload 
     * @returns 结果
     */
    async execute(taskType, payload) {
        try {
            const ruleEngine = new RuleEngine({ isVis: true });
            const fetcher = new PuppeteerDataFetcher(this.#config, ruleEngine);
            const visService = new RuleForWebVisService(fetcher);

            const { testUrl, rule } = payload;
            const result = await visService.ruleVis(testUrl, rule);

            const rslArray = result.get(rule.ruleName);

            return rslArray;
        } catch (error) {
            error.stack = `RuleVisExecutor::execute: ${import.meta.filename}\n${error.stack}`;
            throw error;
        }
    }
}
export default RuleVisExecutor;