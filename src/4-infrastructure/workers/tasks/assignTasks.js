//根据任务类型分派任务
import { TASK_TYPES } from "../../../3-domain/constants/Task.js";
import { ITaskExecutor } from "../../../2-application/ports/ITaskExecutor.js"
import { AppError } from "../../../5-shared/errors/index.js";
/**
 * 根据任务类型组装执行器
 * @param {TASK_TYPES} taskType 任务类型
 * @param {Object} config 服务器配置
 * @param {Object} repositories 线程资源（线程初始化时获得的资源）
 * @returns {ITaskExecutor} 
 */
export async function assignTasks(taskType, config, repositories) {
    let executor = null;
    const assemblerDir = "../../../2-application/thread-assemblers/";//线程专用服务，装配工厂目录
    let createTask = "";

    switch (taskType) {
        case TASK_TYPES.EXPORT_BOOK:
            createTask = "exportBook.assembler.js";
            break;
        default:
            throw new AppError("尚未开发对接的任务类型：" + taskType);
    }

    try {
        const creater = await import(assemblerDir + createTask);
        executor = creater?.default(config, repositories);
        if (!executor instanceof ITaskExecutor) throw new AppError(`线程执行逻辑需实现接口[ITaskExecutor]。模块：${assemblerDir + createTask}\n`);
    } catch (error) {
        console.warn("子线程执行失败-组装线程启动器失败：", createTask, error);
    }

    return executor;
}