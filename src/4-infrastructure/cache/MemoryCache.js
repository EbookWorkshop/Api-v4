class MemoryCache {
    #cache;
    #timers;
    #defaultTTL;
    #maxSize;
    #stats;
    constructor(options = {}) {
        this.#cache = new Map();
        this.#timers = new Map();
        this.#defaultTTL = options.defaultTTL || 30 * 60 * 1000;
        this.#maxSize = options.maxSize || 10000;
        this.#stats = { hits: 0, misses: 0, sets: 0 };
    }

    set(key, value, ttlMs) {
        // 清理旧数据
        if (this.#timers.has(key)) {
            clearTimeout(this.#timers.get(key));
        }

        // 防止内存泄漏：如果缓存过大，清理已过期的
        if (this.#cache.size >= this.#maxSize) {
            this.#evictExpired();
        }

        this.#cache.set(key, value);
        this.#stats.sets++;

        const timer = setTimeout(() => {
            this.delete(key);
        }, ttlMs || this.#defaultTTL);
        this.#timers.set(key, timer);
    }

    get(key) {
        if (this.#cache.has(key)) {
            this.#stats.hits++;
            return this.#cache.get(key);
        }
        this.#stats.misses++;
        return undefined;
    }

    delete(key) {
        if (this.#timers.has(key)) {
            clearTimeout(this.#timers.get(key));
            this.#timers.delete(key);
        }
        return this.#cache.delete(key);
    }

    #evictExpired() {
        // 简单策略：清理掉一半
        const keys = Array.from(this.#cache.keys());
        const toDelete = keys.slice(0, Math.floor(keys.length / 2));
        for (const key of toDelete) {
            this.delete(key);
        }
    }

    // 可选：获取统计信息（用于调试）
    getStats() {
        return { ...this.#stats, size: this.#cache.size };
    }
}