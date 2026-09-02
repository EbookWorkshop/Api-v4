import { TASK_TYPES } from "../../3-domain/constants/Task.js";

import { CollectExecutor } from "../services/executor/CollectExecutor.js";
import { SystemConfigService } from "../services/SystemConfigService.js";
import { ReviewDictionaryService } from "../services/ReviewDictionaryService.js";
import { RuleForWebQueryService } from "../services/RuleForWebQueryService.js";



/**
 * 创建采集执行器
 * @param {Object} config 
 * @param {TASK_TYPES} taskType 
 * @param {Object} repositories 
 * @returns 
 */
export function createCollectExecutor(config, taskType, repositories) {

    const systemConfigService = new SystemConfigService(repositories.systemConfigRepository);
    const rdSer = new ReviewDictionaryService(repositories.dictionaryRepository);
    const ruleService = new RuleForWebQueryService(repositories.ruleForWebRepository, systemConfigService, rdSer);

    


    return new CollectExecutor(config, ruleService, repositories);
}

export default createCollectExecutor;