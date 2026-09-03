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
                maxTaskNum: 8,
            })

            this.#workerPool.addTask(task);
            return `已添加到任务：${task.taskId}` //{ taskId: task.taskId };
        } catch (error) {
            throw new AppError("添加采集任务失败：" + error.message);
        }
    }

    /**
     * 提交采集单章任务
     * @param {object} setting 
     * @returns 
     */
    async submitCollectSingleChapterTask(setting) {
        try {
            const task = new Task({
                taskId: crypto.randomUUID(),
                param: setting,
                taskType: TASK_TYPES.SINGLE_CHAPTER_COLLECT,
                useDB: true,
                maxTaskNum: 2,
            })

            this.#workerPool.addTask(task);
            return `已添加到任务：${task.taskId}` //{ taskId: task.taskId };
        } catch (error) {
            throw new AppError("添加采集任务失败：" + error.message);
        }
    }

    /**
     * 提交更新章节任务
     * #### 会拆解为每章一个任务 
     * @param {*} chapterIds 
     * @param {*} setting 
     */
    async submitUpdateChapters(chapterIds, setting) {
        try {
            const taskIds = [];
            for (const cid of chapterIds) {
                setting.chapterId = cid;
                const task = new Task({
                    taskId: crypto.randomUUID(),
                    param: setting,
                    taskType: TASK_TYPES.WEB_BOOK_CHAPTER_COLLECT,
                    useDB: true,
                    maxTaskNum: 5,
                })
                this.#workerPool.addTask(task);
                taskIds.push(task.taskId);
            }
            return { message: `已添加到任务x${chapterIds.lenngth}`, taskid: taskIds }
        } catch (error) {
            throw new AppError("添加采集任务失败：" + error.message);
        }
    }

    /**
     * 更新章节——合并章节目录
     * @param {*} setting 
     * @returns 
     */
    async submitUpdateIndex(setting) {
        try {
            const task = new Task({
                taskId: crypto.randomUUID(),
                param: setting,
                taskType: TASK_TYPES.WEB_BOOK_UPDATE_INDEX,
                useDB: true,
                maxTaskNum: 8,
            })

            this.#workerPool.addTask(task);
            return `已添加到任务：${task.taskId}` //{ taskId: task.taskId };
        } catch (error) {
            throw new AppError("添加采集任务失败：" + error.message);
        }
    }

}