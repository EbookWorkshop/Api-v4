import { TASK_TYPES } from "../../3-domain/constants/Task.js";
import { CompressDatabaseExecutor } from "../services/executor/CompressDatabaseExecutor.js";


/**
 * 创建执行器
 * @param {Object} config 
 * @param {TASK_TYPES} taskType 
 * @param {Object} resources 
 * @returns {ITaskExecutor}
 */
export function createCompressDatabaseExecutor(config, taskType, resources) {
    const { sequelize } = resources.repositories;
    return new CompressDatabaseExecutor(sequelize);
}

export default createCompressDatabaseExecutor;