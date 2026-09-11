import crypto from "node:crypto";
import { TASK_TYPES } from '../constants/Task.js';
import { Task } from '../../4-infrastructure/workers/index.js';
import { AppError } from "../../5-shared/errors/index.js";

export class TaskSchedulerService {
    /** @type {WorkerPool} 线程池 */
    #workerPool;
    /** @type {BatchProgressTracker} 批量统计 */
    #progressTracker;

    /**
     * @param {import('../../4-infrastructure/workers/index.js').WorkerPool} workerPool
     * @param {import('./BatchProgressTracker.js').BatchProgressTracker} progressTracker
     */
    constructor(workerPool, progressTracker) {
        this.#workerPool = workerPool;
        this.#progressTracker = progressTracker;
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
            return `已添加任务：${task.taskId}` //{ taskId: task.taskId };
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
            return `已添加任务：${task.taskId}` //{ taskId: task.taskId };
        } catch (error) {
            throw new AppError("添加采集任务失败：" + error.message);
        }
    }

    /**
     * 提交批量更新章节任务
     * 每个章节拆为一个子任务，通过 BatchProgressTracker 汇总进度
     * @param {number[]} chapterIds
     * @param {{ bookId: number, isUpdate: boolean, bookName?: string }} setting 接口提交的参数
     * @returns {{ batchId: string, total: number, taskIds: string[], message: string }}
     */
    async submitUpdateChapters(chapterIds, setting) {
        if (!Array.isArray(chapterIds) || chapterIds.length === 0) {
            throw new AppError("chapterIds 不能为空");
        }

        const { bookId, isUpdate, bookName } = setting;
        const batchId = crypto.randomUUID();
        const total = chapterIds.length;

        // ① 先注册批次，确保 0% 进度能被前端收到
        this.#progressTracker.register(batchId, {
            type: TASK_TYPES.WEB_BOOK_CHAPTER_COLLECT,
            bookId,
            bookName,
            chapterIds,
        });

        const taskIds = [];
        const dispatchFailures = [];

        for (const cid of chapterIds) {
            try {
                const taskId = crypto.randomUUID();
                const task = new Task({
                    taskId,
                    param: { bookId, isUpdate, chapterId: cid, batchId, taskId },
                    taskType: TASK_TYPES.WEB_BOOK_CHAPTER_COLLECT,
                    useDB: true,
                    maxTaskNum: 5,
                    callback: ({ data, error }) => {
                        this.#progressTracker.onTaskSettled(batchId, cid, { data, error });
                    },
                });
                this.#workerPool.addTask(task);
                taskIds.push(taskId);
            } catch (err) {
                dispatchFailures.push({ chapterId: cid, error: err });
            }
        }

        // ② 调度失败的任务立即计入 fail，避免批次永远卡在 running
        for (const { chapterId, error } of dispatchFailures) {
            this.#progressTracker.onTaskSettled(batchId, chapterId, { error });
        }

        return {
            batchId,
            total,
            taskIds,
            message: `已添加任务 x${total}`,
        };
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
            return `已添加任务：${task.taskId}` //{ taskId: task.taskId };
        } catch (error) {
            throw new AppError("添加采集任务失败：" + error.message);
        }
    }

    /**
     * 更新系统版本信息
     * @returns 
     */
    async submitUpdateVersion() {
        try {
            const task = new Task({ taskType: TASK_TYPES.SYSTEM_VERSION });
            this.#workerPool.addTask(task);
            return `已添加任务：${task.taskId}`
        } catch (error) {
            throw new AppError("添加任务失败：" + error.message);
        }
    }

    /**
     * 执行规则可视化
     * @param {*} testUrl 
     * @param {*} rule 
     * @returns 
     */
    async submitBotRuleVis(testUrl, rule) {
        try {
            const task = new Task({
                taskType: TASK_TYPES.BOTRULE_VIS,
                param: { testUrl, rule },
                callback: ({ data, error }) => {
                    console.log("【任务】规则预览已执行完成！，已采集数据：", data);
                    //TODO: Socket 发消息展示采集结果
                }
            });
            this.#workerPool.addTask(task);
            return `已添加任务：${task.taskId}`
        } catch (error) {
            throw new AppError("添加任务失败：" + error.message);
        }
    }

    async submitCompressDdatabase() {
        try {
            const task = new Task({
                taskType: TASK_TYPES.COMPRESS_DATABASE,
                useDB: true,
            });
            this.#workerPool.addTask(task);
            return `已添加任务：${task.taskId}`
        } catch (error) {
            throw new AppError("添加任务失败：" + error.message);
        }
    }
}