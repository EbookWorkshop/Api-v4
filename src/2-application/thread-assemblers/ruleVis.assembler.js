import { TASK_TYPES } from "../../3-domain/constants/Task.js";
import { RuleVisExecutor } from "../services/executor/RuleVisExecutor.js";
import { ServiceServer } from "../../4-infrastructure/server/ServiceServer.js"


/**
 * 创建采集执行器
 * @param {Object} config 
 * @param {TASK_TYPES} taskType 
 * @param {Object} resources 
 * @returns {ITaskExecutor}
 */
export function createRuleVisExecutor(config, taskType, resources) {
    return new RuleVisExecutor(config);
}

export default createRuleVisExecutor;