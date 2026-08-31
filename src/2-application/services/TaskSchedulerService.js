import crypto from "node:crypto";
import { TASK_TYPES } from '../../3-domain/constants/Task.js';
import { WorkerPool, Task } from '../../4-infrastructure/workers/index.js';
import { AppError } from "../../5-shared/errors/index.js";

export class TaskSchedulerService {
    /** @type {WorkerPool} 线程池 */
    #workerPool;

    /**
     * @param {WorkerPool} workerPool 
     */
    constructor(workerPool) {
        this.#workerPool = workerPool;
    }

    /**
     * 提交导出任务
     * @param {*} setting 
     * @returns 
     */
    async submitExportTask(setting) {
        try {
            const task = new Task({
                taskId: crypto.randomUUID(),
                param: setting,
                taskType: TASK_TYPES.EXPORT_BOOK,
                useDB: true,
                // callback: async ({ data, error }) => {
                //     console.log("导出完成后的回调函数，返回参数：", data, error);
                // },
            })

            this.#workerPool.addTask(task);
            return { taskId: task.taskId };
        } catch (error) {
            throw new AppError("添加导出任务失败：" + error.message);
            // return { taskId: null, error };
        }
    }

    /**
     * 提交创建 WebBook 任务
     * @param {Object} setting 
     * @param {boolean} setting.isEmbedBookName   封面是否嵌入文本标题
     * @param {string} setting.sourcePage   目录页
     * @param {string?} setting.infoPage    信息页
     * @returns 
     */
    async submitCreateWebBookTask(setting) {
        try {
            const task = new Task({
                taskId: crypto.randomUUID(),
                param: setting,
                taskType: TASK_TYPES.WEB_BOOK_COLLECT,
                useDB: true,
            })

            this.#workerPool.addTask(task);
            return { taskId: task.taskId };
        } catch (error) {
            throw new AppError("添加采集任务失败：" + error.message);
        }
    }
}