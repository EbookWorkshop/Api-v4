
import os from "node:os";
import path from "node:path";
import crypto from "node:crypto";
import { Worker } from 'worker_threads';
import { AsyncResource } from 'async_hooks';

import { AppError } from "../../../5-shared/errors/index.js"
import { WorkerQueue } from "./WorkerQueue.js";
import { TASK_MESSAGE_TYPE } from "../../../3-domain/constants/Task.js"
import { Task } from "../tasks/Task.js";

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
     * 最大线程数
     * @type {number}
     */
    #maxThreadsNum;

    /**
     * 已激活线程池——无数据库
     * @type {WorkerQueue}
    */
    #workerQueueNoDB;
    /**
     * 已激活线程池——带数据库
     * @type {WorkerQueue}
     */
    #workerQueueWithDB;

    /**
     * 排队中的任务/按进程类型分组
     * @type {Map<string,Array<Task>>}
     */
    #waitingTask;

    /**
     * 需要按类型限制总运行数量的线程运行数统计/按进程类型分组
     * @type {Map<string,number>}
     */
    #runningThreadCountByType;

    /**
     * 初始化线程池
     * @param {number} numThreads 最大线程数
     */
    constructor(config, { numThreads } = {}) {
        this.#config = config;
        if (!numThreads) {
            const cpuNum = os.cpus().length;
            numThreads = Math.min(cpuNum, MAX_THREAD_NUM);
        }
        this.#maxThreadsNum = numThreads;

        this.#workerQueueNoDB = new WorkerQueue();
        this.#workerQueueWithDB = new WorkerQueue();

        this.#waitingTask = new Map();
        this.#runningThreadCountByType = new Map();
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
        const callback = worker[kTaskCallback];
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
                if (this.workerDebug) console.log("线程执行出错：", error);
                this.#freeAWorker(worker);
                break;
            case TASK_MESSAGE_TYPE.TASK_COMPLETED:
                if (this.workerDebug) console.log("线程已执行完成，耗时：", performance.now() - worker[kTaskStartTime]);
                this.#freeAWorker(worker);
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
            this.#freeAWorker(worker);//释放线程计数
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

            tl.shift();
            this.#runningThreadCountByType.set(curTask.taskType, runningTask + 1);
            const { callback, ...task } = curTask;
            worker[kTaskCallback] = callback;
            worker[kTaskData] = task;
            worker[kTaskStartTime] = performance.now();
            worker.postMessage(task);//发送到子线程。
        } catch (error) {
            // if (curTask) this.addTask(curTask);//出了问题，重新排队 但可能会死锁，因为任务可能本身有错
            if (curTask) { console.log("运行出错，任务可能已经丢失：", curTask) }
            throw new AppError("线程执行错误：" + error.message);
        }
    }

    /**
     * 闲置一个进程
     * @param {Worker} worker 
     */
    #freeAWorker(worker) {
        const { taskType } = worker[kTaskData];
        worker[kTaskCallback] = null;
        worker[kTaskData] = null;

        const runNum = this.#runningThreadCountByType.get(taskType) || 1;
        this.#runningThreadCountByType.set(taskType, runNum - 1);

        this.#workersQueue(worker.withDB).free(worker);
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

            if (this.hasFeeWorker || this.workerCount < this.#maxThreadsNum) this.#runTask();
        } catch (error) {
            if (this.#config?.debug?.mode) console.error(error);
            throw error;
        }
    }

    get hasFeeWorker() { return this.#workerQueueWithDB.hasFeeWorker || this.#workerQueueNoDB.hasFeeWorker }
    get workerCount() { return this.#workerQueueNoDB.workerNum + this.#workerQueueWithDB.workerNum; }
    get workerDebug() { return this.#config?.debug?.mode && this.#config?.debug?.switch?.worker; }
    #workersQueue(useDB) { return useDB ? this.#workerQueueWithDB : this.#workerQueueNoDB; }
}