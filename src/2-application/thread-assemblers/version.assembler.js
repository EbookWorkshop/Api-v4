// import { TASK_TYPES } from "../constants/Task.js";
import { UpdateVersionExecutor } from "../services/executor/UpdateVersionExecutor.js";
import { ServiceServer } from "../../4-infrastructure/server/ServiceServer.js"


/**
 * 创建执行器
 * @param {Object} config 
 * @param {import("../constants/Task.js").TaskType} taskType 
 * @param {Object} resources 
 * @returns {import("../ports/ITaskExecutor.js").ITaskExecutor}
 */
export function createUpdateVersionExecutor(config, taskType, resources) {
    return new UpdateVersionExecutor(new ServiceServer(config));
}

export default createUpdateVersionExecutor;