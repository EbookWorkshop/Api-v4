//根据任务类型分派任务
import path from "node:path";
import { TASK_TYPES } from "../../../3-domain/constants/Task.js";
import { ITaskExecutor } from "../../../2-application/ports/ITaskExecutor.js"
import { AppError } from "../../../5-shared/errors/index.js";

/**
 * 根据任务类型组装执行器
 * @param {TASK_TYPES} taskType 任务类型
 * @param {Object} repositories
 * @returns {ITaskExecutor} 
 */
export async function assignTasks(taskType, repositories, config) {
    let executor = null;
    let createTask = "";

    switch (taskType) {
        case TASK_TYPES.EXPORT_BOOK:
            createTask = "./taskExportBook.js";
            break;
        default:
            throw new AppError("尚未开发对接的任务类型。");
    }

    try {
        const creater = await import(createTask);
        executor = creater?.default(repositories, config);
    } catch (error) {
        console.warn("子线程执行失败-组装线程启动器失败：", createTask, error);
    }


    return executor;
}