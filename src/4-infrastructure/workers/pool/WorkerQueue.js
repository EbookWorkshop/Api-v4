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

    free(worker) {
        this.#freeWorkers.add(worker);
    }


    /**
     * 是否有空闲线程
     * @returns {boolean}
     */
    get hasFeeWorker() { return this.#freeWorkers.size > 0; }
    get feeWokerNum() { return this.#freeWorkers.size; }
    get workerNum() { return this.#workers.size; }
}