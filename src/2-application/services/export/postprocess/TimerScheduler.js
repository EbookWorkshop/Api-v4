export class TimerScheduler {
    #timers = new Set();
    #pending = new Set();

    delay(ms) {
        let promise;
        const timer = setTimeout(() => {
            this.#timers.delete(timer);
            this.#pending.delete(promise);
            resolve();
        }, ms);
        let resolve;
        promise = new Promise((r) => { resolve = r; });
        this.#timers.add(timer);
        this.#pending.add(promise);
        return promise;
    }

    /**
     * 等待所有尚未触发的定时器执行完毕
     */
    async waitAll() {
        await Promise.allSettled([...this.#pending]);
    }

    clearAll() {
        for (const t of this.#timers) clearTimeout(t);
        this.#timers.clear();
        this.#pending.clear();
    }
}