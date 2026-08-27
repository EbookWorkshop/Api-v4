import { randomUUID } from "node:crypto";
import { TASK_TYPES, TASK_STATUS } from "../../../3-domain/constants/Task.js";
/**
 * 表示一个可被线程池执行的任务。
 */
export class Task {
    /** @type {string} 模块文件地址，可用 '@' 代表根目录 */
    taskId;
    /** @type {any} 线程执行的传入参数（需要可序列化） */
    param;
    /** @type {TASK_TYPES} [taskType] 用于确认线程运行方式的标记 */
    taskType;
    /** @type {number} [maxTaskNum] 该类别允许的最大线程数，小于1则不限制 */
    maxTaskNum;
    /** @type {boolean} 是否优先执行，默认为false */
    highPriority;
    /** @type {boolean} 是否需要数据库功能 */
    useDB;
    /** @type {undefined|function({error: Error, data: Object}): void} 执行后回调 */
    callback;
    /** @type {TASK_STATUS}  运行状态*/
    status;


    /**
     * 创建一个 Task 实例。
     * @param {Object} options - 任务配置对象。
     * @param {string} options.taskId - 任务ID
     * @param {any} options.param - 线程执行的传入参数（需要可序列化）
     * @param {TASK_TYPES} [options.taskType] - 用于确认线程运行方式的标记
     * @param {number} [options.maxTaskNum] - 该类别允许的最大线程数，小于1则不限制
     * @param {number} [options.highPriority] - 是否优先执行，默认为false
     * @param {number} [options.useDB] - 是否需要数据库功能
     * @param {undefined|function({error: Error, data: Object}): void} options.callback - 任务完成回调。
     */
    constructor({ taskId, param, taskType, maxTaskNum, highPriority, useDB, callback }) {
        this.taskId = taskId || randomUUID();
        this.param = param;
        this.taskType = taskType;
        this.maxTaskNum = maxTaskNum;
        this.callback = callback;
        this.highPriority = highPriority || false;
        this.useDB = useDB;

        this.status = TASK_STATUS.PENDING;
        this.useMS = 0;//耗时
    }
}