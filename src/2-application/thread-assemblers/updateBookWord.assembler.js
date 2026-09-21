
import { TASK_TYPES } from "../../2-application/constants/Task.js";
import { UpdateBookWordExecutor } from "../services/executor/UpdateBookWordExecutor.js";


/**
 * 创建执行器
 * @param {Object} config 
 * @param {TASK_TYPES} taskType 
 * @param {Object} resources 
 * @returns {import("../ports/ITaskExecutor.js").ITaskExecutor}
 */
export function createUpdateBookWordExecutor(config, taskType, resources) {
    return new UpdateBookWordExecutor(resources.ebookRepository);
}
export default createUpdateBookWordExecutor;
