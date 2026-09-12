// import { TASK_TYPES } from "../constants/Task.js";
import { CompressDatabaseExecutor } from "../services/executor/CompressDatabaseExecutor.js";


/**
 * 创建执行器
 * @param {Object} config 
 * @param {import("../constants/Task.js").TaskType} taskType 
 * @param {Object} resources 
 * @returns {import("../ports/ITaskExecutor.js").ITaskExecutor}
 */
export function createCompressDatabaseExecutor(config, taskType, resources) {
    const { sequelize } = resources.repositories;
    return new CompressDatabaseExecutor(sequelize);
}

export default createCompressDatabaseExecutor;