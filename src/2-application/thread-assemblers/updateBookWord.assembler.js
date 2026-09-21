
import { TASK_TYPES } from "../../2-application/constants/Task.js";
import { UpdateBookWordExecutor } from "../services/executor/UpdateBookWordExecutor.js";
import { BookAnalysisService } from "../services/BookAnalysisService.js"
import { SystemConfigService } from "../services/SystemConfigService.js";


/**
 * 创建执行器
 * @param {Object} config 
 * @param {TASK_TYPES} taskType 
 * @param {Object} resources 
 * @returns {import("../ports/ITaskExecutor.js").ITaskExecutor}
 */
export function createUpdateBookWordExecutor(config, taskType, resources) {
    const { repositories } = resources;
    const systemConfigService = new SystemConfigService(repositories.systemConfigRepository);
    const bookAnalysis = new BookAnalysisService(repositories.ebookRepository, repositories.chapterRepository, systemConfigService);

    return new UpdateBookWordExecutor(repositories.ebookRepository, bookAnalysis);
}
export default createUpdateBookWordExecutor;
