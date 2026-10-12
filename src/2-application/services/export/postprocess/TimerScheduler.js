export class TimerScheduler {
    #timers = new Set();

    /**
     * 延时指定毫秒
     * @param {number} ms
     * @returns {Promise<void>}
     */
    delay(ms) {
        return new Promise((resolve) => {
            const timer = setTimeout(() => {
                this.#timers.delete(timer);
                resolve();
            }, ms);
            this.#timers.add(timer);
        });
    }

    /**
     * 清理所有未触发的定时器
     */
    clearAll() {
        for (const timer of this.#timers) {
            clearTimeout(timer);
        }
        this.#timers.clear();
    }
}