import { EventEmitter } from 'node:events';
import { isMainThread, parentPort } from 'node:worker_threads';
import { TASK_MESSAGE_TYPE } from "../../3-domain/constants/Task.js"

export class EventManager {
    /** @type {EventEmitter} */
    #emitter;

    /**
     * 依赖注入：由外部（system.js）传入 EventEmitter 实例
     * 不要在这里 new EventEmitter()
     */
    constructor(emitter) {
        this.#emitter = emitter;
    }

    /**
     * 监听事件（对外屏蔽底层实现细节）
     * @param {string|symbol} eventName
     * @param listener
     */
    on(eventName, listener) {
        this.#emitter.on(eventName, listener);
        // 可在此添加日志：console.log(`[Event] Listener attached to ${eventName}`);
        return this; // 支持链式调用
    }

    /**
     * 触发事件
     * @param {string|symbol} eventName
     */
    emit(eventName, ...args) {
        return this.#emitter.emit(eventName, ...args);
    }

    /**
     * 向主线程，触发
     * @param {string|symbol} eventName 
     * @param  {...any} args 
     * @returns 
     */
    emitToMain(eventName, ...args) {
        //已在主线程中
        if (isMainThread) return this.emit(eventName, ...args);

        parentPort?.postMessage({
            type: TASK_MESSAGE_TYPE.TASK_EVENT_ENVELOPE,
            eventName,
            args_data: [...args],
        });
    }

    /**
     * 移除监听
     */
    off(eventName, listener) {
        this.#emitter.off(eventName, listener);
        return this;
    }

    /**
     * 一次性监听
     */
    once(eventName, listener) {
        this.#emitter.once(eventName, listener);
        return this;
    }
}