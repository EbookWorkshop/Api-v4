import { randomUUID } from "node:crypto";
import { TASK_STATUS } from "../../../2-application/constants/Task.js";



/**
 * 表示一个可被线程池执行的任务。
 */
export class Task {
    /** @type {string} 任务ID */
    taskId;
    /** @type {string} 执行器ID */
    workerId;
    /** @type {any} 线程执行的传入参数（需要可序列化） */
    param;
    /** @type {import("../../../2-application/constants/Task.js").TaskType} taskType 用于确认线程运行方式的标记 */
    taskType;
    /** @type {number} [maxTaskNum] 该类别允许的最大线程数，小于1则不限制 */
    maxTaskNum;
    /** @type {boolean} 是否优先执行，默认为false */
    highPriority;
    /** @type {boolean} 是否需要数据库功能 */
    useDB;
    /** @type {undefined | ((arg: {error: Error, data: Object}) => void)} 执行后回调 */
    callback;
    /** @type {import("../../../2-application/constants/Task.js").TaskStatus}  运行状态*/
    status;

    startTime;

    /**
     * 创建一个 Task 实例。
     * @param {Object} options - 任务配置对象。
     * @param {import("../../../2-application/constants/Task.js").TaskType} options.taskType - 用于确认线程运行方式的标记
     * @param {string} [options.taskId] - 任务ID 缺省会自动创建
     * @param {any} [options.param] - 线程执行的传入参数（需要可序列化）
     * @param {number} [options.maxTaskNum] - 该类别允许的最大线程数，小于1则不限制
     * @param {boolean} [options.highPriority] - 是【否】优先执行，默认为false
     * @param {boolean} [options.useDB] - 是【否】需要数据库功能
     * @param {undefined | ((arg: {error: Error, data: Object}) => void)} options.callback - 任务完成回调。
     */
    constructor({ taskId, param, taskType, maxTaskNum, highPriority, useDB, callback }) {
        this.taskId = taskId || randomUUID();
        this.param = param;
        this.taskType = taskType;
        this.maxTaskNum = maxTaskNum || 0;
        this.callback = callback;
        this.highPriority = highPriority || false;
        this.useDB = useDB || false;

        this.status = TASK_STATUS.PENDING;
        this.useMS = 0;//耗时
    }
}