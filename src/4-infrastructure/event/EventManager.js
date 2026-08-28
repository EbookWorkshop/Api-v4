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

    // if (!isMainThread) {
    //   // TODO：可以尝试将截获到的消息，通过子线程用线程间通讯转发到主线程，再由主线程通过消息模块转发出去
    //   console.warn("!!!注意!!! 检测到子线程引用了单例模块。子线程使用独立的单例，与主线程的消息模块并不互通。");
    //   console.trace();
    // }
  }

  /**
   * 监听事件（对外屏蔽底层实现细节）
   */
  on(eventName, listener) {
    this.#emitter.on(eventName, listener);
    // 可在此添加日志：console.log(`[Event] Listener attached to ${eventName}`);
    return this; // 支持链式调用
  }

  /**
   * 触发事件
   */
  emit(eventName, ...args) {
    // if (!isMainThread) {        //在子线程中发信息
    //   console.info("尝试在子线程中发消息：\n", eventName, ...args);
    //   console.warn("!!!注意!!!尝试在子线程中使用消息模块！子线程使用独立的单例，与主线程的消息模块并不互通。");
    //   console.trace();
    //   return false;
    // }
    return this.#emitter.emit(eventName, ...args);
  }

  /**
   * 向主线程，触发
   * @param {*} eventName 
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