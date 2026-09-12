import { TASK_TYPES } from "../constants/Task.js";

import { CollectExecutor } from "../services/executor/CollectExecutor.js";
import { SystemConfigService } from "../services/SystemConfigService.js";
import { ReviewDictionaryService } from "../services/ReviewDictionaryService.js";
import { RuleForWebQueryService } from "../services/RuleForWebQueryService.js";

import { WebBookQueryService } from "../services/WebBookQueryService.js"
import { WebBookChapterURLService } from "../services/WebBookChapterURLService.js"

/**
 * 创建采集执行器
 * @param {Object} config 
 * @param {import("../constants/Task.js").TaskType} taskType 
 * @param {Object} resources 
 * @returns {*}
 */
export function createCollectExecutor(config, taskType, resources) {
    const { repositories } = resources;

    const systemConfigService = new SystemConfigService(repositories.systemConfigRepository);
    const rdSer = new ReviewDictionaryService(repositories.dictionaryRepository);
    const ruleService = new RuleForWebQueryService(repositories.ruleForWebRepository, systemConfigService, rdSer);
    /** @type{WebBookChapterURLService|null} */
    let chapService = null;
    if (taskType === TASK_TYPES.WEB_BOOK_CHAPTER_COLLECT) {
        const webBookQueryService = new WebBookQueryService(repositories.webBookRepository, repositories.webBookSourceURLRepository);
        chapService = new WebBookChapterURLService(repositories.webBookChapterURLRepository, webBookQueryService)

    }


    return new CollectExecutor(config, ruleService, resources, chapService);
}

export default createCollectExecutor;