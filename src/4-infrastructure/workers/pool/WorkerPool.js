
import os from "node:os";
import path from "node:path";
import crypto from "node:crypto";
import { Worker } from 'node:worker_threads';
import { AsyncResource } from 'node:async_hooks';

import { AppError } from "../../../5-shared/errors/index.js"
import { TASK_MESSAGE_TYPE, TASK_STATUS } from "../../../3-domain/constants/Task.js"
import { Task } from "../tasks/Task.js";
import { WorkerQueue } from "./WorkerQueue.js";
import { EventManager } from "../../event/EventManager.js";

const MAX_THREAD_NUM = 15;
const kTaskCallback = Symbol('kTaskCallback');
const kTaskData = Symbol('kTaskData');
const kTaskStartTime = Symbol("kTaskStartTime");

/**
 * 线程池
 */
export class WorkerPool {
    #config;
    /**
     * @type {number} 最大线程数
     */
    #maxThreadsNum;

    /**
     * @type {WorkerQueue} 已激活线程池——无数据库
    */
    #workerQueueNoDB;
    /**
     * @type {WorkerQueue} 已激活线程池——带数据库
     */
    #workerQueueWithDB;

    /** @type {WeakMap<Worker,Object>} 当前进程附带数据*/
    #workerData;

    /**
     * @type {Map<string,Array<Task>>} 排队中的任务/按进程类型分组
     */
    #waitingTask;

    /**
     * @type {Map<string,number>} 需要按类型限制总运行数量的线程运行数统计/按进程类型分组
     */
    #runningThreadCountByType;

    /**
     * @type {Array<Task>} 已完成过的历史任务
     */
    #taskHistory;

    #event;

    /**
     * 初始化线程池
     * @param {number} numThreads 最大线程数
     * @param {EventManager} eventSer 消息
     */
    constructor(config, eventSer, { numThreads } = {}) {
        this.#config = config;
        this.#event = eventSer;
        if (!numThreads) {
            const cpuNum = os.cpus().length;
            numThreads = Math.min(cpuNum, MAX_THREAD_NUM);
        }
        this.#maxThreadsNum = numThreads;
        this.#workerData = new WeakMap();
        this.#workerQueueNoDB = new WorkerQueue();
        this.#workerQueueWithDB = new WorkerQueue();

        this.#waitingTask = new Map();
        this.#runningThreadCountByType = new Map();
        this.#taskHistory = new Array();
    }

    /**
     * 创建一个新线程备用
     * @param {boolean} useDB 是否需要数据库
     * @returns {Worker|null}
     */
    #addNewWorker(useDB = false) {
        if (this.workerCount >= this.#maxThreadsNum) return null;
        try {
            const worker = new Worker(path.resolve(import.meta.dirname, "../runner", `run${useDB ? "OnDB" : ""}.js`), {
                workerData: {
                    workerId: crypto.randomUUID(),
                    config: this.#config,
                }
            });
            worker.withDB = useDB;
            if (useDB) this.#workerQueueWithDB.add(worker);
            else this.#workerQueueNoDB.add(worker);

            worker.on("message", (message) => this.#messageHandler(message, worker));
            worker.on("error", (error) => this.#errorHandler(error, worker));

            return worker;
        } catch (error) {
            console.warn("创建线程出错：", error);
            return null;
        }
    }

    #remoteBroadcastEvent(message, worker) {
        const { eventName, data } = message;
        if (!eventName) { console.warn("消息转发失败：已丢失消息名。"); return; }
        this.#event.emit(eventName, ...data);
    }

    /**
     * 消息处理——线程发回的消息
     * @param {Object} message 
     * @param {TASK_MESSAGE_TYPE} message.type 消息类型 
     * @param {Error} message.error 消息类型 
     * @param {Object} message.data 执行返回的数据 
     * @param {Worker} worker 
     */
    async #messageHandler(message, worker) {
        const { type, error, data } = message;
        if (type === TASK_MESSAGE_TYPE.TASK_EVENT_ENVELOPE) return this.#remoteBroadcastEvent(message, worker);
        const callback = this.#workerData.get(worker)[kTaskCallback];
        if (callback && typeof (callback) === "function") {
            const aRunner = new AsyncResource(type);
            try {
                await aRunner.runInAsyncScope(callback, null, { data, error })
            } catch (newerr) {
                console.log("线程的回调执行出错：", newerr);
                throw newerr;
            } finally {
                aRunner.emitDestroy();
            }
        }
        switch (type) {
            case TASK_MESSAGE_TYPE.TASK_ERROR:
                this.#freeAWorker(worker, TASK_STATUS.REJECTED);
                break;
            case TASK_MESSAGE_TYPE.TASK_COMPLETED:
                this.#freeAWorker(worker, TASK_STATUS.FULFILLED);
                this.#runTask();
                break;
        }

        return null;
    }

    /**
     * 线程出错处理
     * @param {Error} error 
     * @param {Worker} worker 
     */
    async #errorHandler(error, worker) {
        try {
            console.warn("线程执行出错：", error);
            this.#freeAWorker(worker, TASK_STATUS.REJECTED);//释放线程计数
        } catch (error) {

        } finally {
            this.#closeWorker(worker);
        }
    }

    /**
     * 获取一个可用线程
     * @param {boolean} useDB 是否需要数据库
     * @returns {Worker|null} null 时是无法取得可用线程
     */
    #getAvailableWorker(useDB) {
        let worker = this.#workersQueue(useDB).getFeeWorker();
        if (!worker && useDB == false && this.#workerQueueWithDB.hasFeeWorker) {//尝试调配更高级资源
            worker = this.#workerQueueWithDB.getFeeWorker();
        }
        if (worker) return worker;

        if (useDB && this.#workerQueueNoDB.hasFeeWorker) {        //无数据库线程足够，但当前需要数据库，尝试回收一个然后重新创建
            const tempWorker = this.#workerQueueNoDB.getFeeWorker();
            this.#workerQueueNoDB.remove(tempWorker);
            this.#addNewWorker(useDB);

            worker = this.#workerQueueWithDB.getFeeWorker();
        }

        if (this.workerCount < this.#maxThreadsNum) worker = this.#addNewWorker(useDB);

        return worker;
    }

    /**
     * 回收进程
     * @param {Worker} worker 
     */
    async #closeWorker(worker) {
        this.#workersQueue(worker.withDB).remove(worker);
        await worker.terminate();
    }

    /**
     * 运行一个任务
     */
    #runTask() {
        if (!this.hasFeeWorker && this.workerCount >= this.#maxThreadsNum) return;
        let curTask = null;
        let tl = null;
        let runningTask = 0;
        try {
            for (let k of this.#waitingTask.keys()) {//这里的逻辑决定了任务调度的顺序
                tl = this.#waitingTask.get(k);
                curTask = tl[0];
                if (curTask) {
                    runningTask = this.#runningThreadCountByType.get(curTask.taskType) || 0;
                    if (curTask.taskType && curTask.maxTaskNum > 0) {//需要限制最大数量的进程
                        if (runningTask >= curTask.maxTaskNum) continue;//当前k（taskType）的正在运行数达到最大值，换下一个任务类型尝试。
                    }
                    break;
                };
            }
            if (curTask == null) return;//没有可用任务，直接退出
            const worker = this.#getAvailableWorker(curTask.useDB);
            if (worker == null) return; //无可用线程
            /********************* 已确定Task和可用的Worker ***********************/
            tl.shift();
            this.#runningThreadCountByType.set(curTask.taskType, runningTask + 1);
            let { callback, ...taskData } = curTask;//解构出callback，结构化克隆不支持函数。不能发送到线程
            curTask.status = TASK_STATUS.EXECUTING;
            this.#workerData.set(worker, {
                [kTaskCallback]: callback,
                [kTaskData]: curTask,//注意：要传对象引用，便于跟进更新对象状态（不要传taskData）。
                [kTaskStartTime]: performance.now(),
            })

            worker.postMessage(taskData);//发送到子线程。
        } catch (error) {
            if (curTask) {
                curTask.status = TASK_STATUS.REJECTED;
                setTimeout(() => this.restartTask(curTask.taskId), 60_000);//一分钟后重试
                console.log("运行出错，任务可能已经丢失：", curTask);
            }
            throw new AppError("线程执行错误：" + error.message);
        }
    }

    /**
     * 闲置一个进程
     * @param {Worker} worker 
     * @param {TASK_STATUS} resule 
     */
    #freeAWorker(worker, resule) {
        const data = this.#workerData.get(worker);
        const task = data[kTaskData];
        task.status = resule;
        task.useMS = performance.now() - data[kTaskStartTime];

        const runNum = this.#runningThreadCountByType.get(task.taskType) || 1;
        this.#runningThreadCountByType.set(task.taskType, runNum - 1);

        this.#workerData.delete(worker);
        this.#workersQueue(worker.withDB).free(worker);

        if (this.workerDebug) console.log(`进程回收，任务状态：${resule}；\t耗时：${task.useMS}ms；\t任务类型：${task.taskType}。`);
    }

    /**
     * 新增任务——其实就是去排队
     * @param {Task} task 
     */
    addTask(task) {
        try {
            const { taskType, highPriority } = task;
            if (!this.#waitingTask.has(taskType)) {
                this.#waitingTask.set(taskType, new Array());
            }
            let taskQueue = this.#waitingTask.get(taskType);

            if (highPriority) taskQueue.unshift(task);
            else taskQueue.push(task);

            this.#taskHistory.push(task);   //加入历史记录

            if (this.hasFeeWorker || this.workerCount < this.#maxThreadsNum) this.#runTask();
        } catch (error) {
            if (this.#config?.debug?.mode) console.error(error);
            throw error;
        }
    }

    /**
     * 重启任务
     * @param {UUID} tid 
     */
    restartTask(tid) {
        const { taskId, ...taskData } = this.#taskHistory.find(t => t.taskId === tid);
        if (!taskId) return;
        this.addTask(new Task(...taskData));
    }

    /**
     * 开足马力
     */
    run() {
        let allTaskNum = 0;
        for (let k of this.#waitingTask.keys()) allTaskNum += this.#waitingTask.get(k).length;
        if (allTaskNum <= 0) return;
        let maxTry = 20;
        while (this.workerCount < this.#maxThreadsNum && --maxTry) this.#runTask();
    }

    get hasFeeWorker() { return this.#workerQueueWithDB.hasFeeWorker || this.#workerQueueNoDB.hasFeeWorker }
    get workerCount() { return this.#workerQueueNoDB.workerNum + this.#workerQueueWithDB.workerNum; }
    get workerDebug() { return this.#config?.debug?.mode && this.#config?.debug?.switch?.worker; }
    #workersQueue = (useDB) => useDB ? this.#workerQueueWithDB : this.#workerQueueNoDB;
}