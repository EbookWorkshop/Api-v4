import { TASK_TYPES } from "../../3-domain/constants/Task.js";
import { UpdateVersionExecutor } from "../services/executor/UpdateVersionExecutor.js";
import { ServiceServer } from "../../4-infrastructure/server/ServiceServer.js"


/**
 * 创建采集执行器
 * @param {Object} config 
 * @param {TASK_TYPES} taskType 
 * @param {Object} resources 
 * @returns {ITaskExecutor}
 */
export function createUpdateVersionExecutor(config, taskType, resources) {
    return new UpdateVersionExecutor(new ServiceServer(config));
}

export default createUpdateVersionExecutor;