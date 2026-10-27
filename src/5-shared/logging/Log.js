import { workerData } from 'node:worker_threads';
import { normalizeError } from '../errors/index.js';
const { workerId } = workerData ?? {};

const LogLevel = {
    none: 0,
    error: 1,
    warn: 2,
    info: 3,
    log: 4,
    debug: 5,
}

export class Log {
    /** @type {{ write(type: string, message: string): void } | null} */
    #logger = null;      // 初始为 null，等待组合根注入
    #config = { level: 'info' };

    /**
     * 
     * @param {*} config 
     * @param {{ write(type: string, message: string): void } | null} logger 
     */
    initialize(config, logger) {
        this.#config = config;
        this.#logger = logger;
    }

    error(...param) {
        if (!this.#isEnabled('error')) return null;
        return this.#write('error', ...param);
    }

    warn(...param) {
        if (!this.#isEnabled('warn')) return null;
        return this.#write('warn', ...param);
    }

    info(...param) {
        if (!this.#isEnabled('info')) return null;
        return this.#write('info', ...param);
    }
    log(...param) {
        if (!this.#isEnabled('log')) return null;
        return this.#write('log', ...param);
    }

    debug(...param) {
        if (!this.#isEnabled('debug')) return null;
        return this.#write('debug', ...param);
    }

    #isEnabled(level) {
        const current = LogLevel[this.#config.level] ?? LogLevel['info'];//配置的等级
        const target = LogLevel[level];//想调用的等级
        return current >= target;
    }

    #format(type, ...param) {
        const tInfo = workerId ? `\t【线程：${workerId}】` : ``;
        return `(${new Date().toLocaleString()})[${type}]:\t${tInfo}${param.map(t =>
            typeof t === 'object' ? normalizeError(t) : String(t)
        ).join('\t')}`;
    }

    #write(type, ...param) {
        if (!this.#logger) {
            // 降级到 console（初始化前的保护）
            console[type](...param);
            return;
        }
        return this.#logger?.write(type, this.#format(type, ...param));
    }
}