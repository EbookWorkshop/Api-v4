// @ts-nocheck
// 原因：WorkerPool 大量使用 Symbol 键和 Worker 动态扩展属性，
// checkJs 对这类底层工具代码收益低、噪音大，选择跳过。

export class WorkerQueue {
    /**@type Set<Worker> */
    #workers;
    /**@type Set<Worker> */
    #freeWorkers;

    constructor() {
        this.#workers = new Set();
        this.#freeWorkers = new Set()
    }

    /**
     * 取得一个闲线程（先进先出）
     * # 获取成功时会标记为占用（从空闲线程中移除）
     * @returns {Worker|null}
     */
    getFeeWorker() {
        if (this.#freeWorkers.size == 0) return null;
        const firstItem = this.#freeWorkers.values().next().value;
        this.#freeWorkers.delete(firstItem);
        return firstItem;
    }

    /**
     * 获取首个（也是等待最久的那个）线程的参数（主要是看等待时长）
     * @param {*} param 
     * @returns 
     */
    getFeeWorkerParam(param) {
        if (this.#freeWorkers.size == 0) return null;
        const firstItem = this.#freeWorkers.values().next().value;
        return firstItem[param];
    }

    /**
     * 加入线程、并记录到空线程
     */
    add(worker) {
        this.#workers.add(worker);
        this.#freeWorkers.add(worker);
    }

    /**
     * 移除线程
     * @param {*} worker 
     */
    remove(worker) {
        this.#freeWorkers.delete(worker);
        this.#workers.delete(worker);
    }

    findById(workerId) {
        for (let worker of this.#workers) if (worker.workerId === workerId) return worker;
        return null;
    }


    free(worker) { this.#freeWorkers.add(worker); }
    use(worker) { this.#freeWorkers.delete(worker); }
    isFree(worker) { return this.#freeWorkers.has(worker); }

    /**
     * 是否有空闲线程
     * @returns {boolean}
     */
    get hasFeeWorker() { return this.#freeWorkers.size > 0; }
    get feeWokerNum() { return this.#freeWorkers.size; }
    get workerNum() { return this.#workers.size; }
    get entries() { return this.#workers.entries() }
    get feeEntries() { return this.#freeWorkers.entries() }
}