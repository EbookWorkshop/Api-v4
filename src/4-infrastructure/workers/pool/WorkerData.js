

export class WorkerData {
    #workerData;
    #isDebug;
    constructor(isDebug) {
        this.#isDebug = isDebug;
        this.#workerData = new WeakMap();

        this.has = this.#workerData.has.bind(this.#workerData);
    }

    get(key) {
        if (this.#isDebug) {
            console.log(`尝试获取数据，Key:[${key.workerId || key}]`);
        }
        return this.#workerData.get(key);
    }

    set(key, value) {
        if (this.#isDebug) {
            console.log(`设置数据。\tKey:[${key.workerId || key}]\t\t对象：TaskId:[${value?.taskId}]`);
        }
        return this.#workerData.set(key, value)
    }

    delete(key) {
        if (this.#isDebug) {
            console.log(`删除数据。 \tKey:[${key.workerId || key}]`);
        }
        return this.#workerData.delete(key);
    }
}