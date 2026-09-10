// 2-application/events/CollectEventEmitter.js
export class CollectEventEmitter {
    #eventManager;
    #context;

    /**
     * @param {EventManager} eventManager
     * @param {{ taskId?: string, batchId?: string, bookId?: number, bookName?: string }} context
     */
    constructor(eventManager, context = {}) {
        this.#eventManager = eventManager;
        this.#context = context;
    }

    /**
     * 派生一个更具体的 emitter（带额外上下文）
     */
    with(extra) {
        return new CollectEventEmitter(this.#eventManager, { ...this.#context, ...extra });
    }

    success(event, { ctx = {}, data = {}, message = '' } = {}) {
        return this.#send(event, { ctx, ok: true, data, message });
    }

    failure(event, { ctx = {}, error, message = '' } = {}) {
        return this.#send(event, { ctx, ok: false, error, message });
    }

    start(event, { ctx = {}, message = '' } = {}) {
        return this.#send(event, { ctx, ok: true, data: {}, message });
    }

    #send(event, envelope) {
        return emitCollect(this.#eventManager, event, {
            ...this.#context,
            ...envelope,
            ctx: { ...this.#context.ctx, ...envelope.ctx },
        });
    }
}

/*
TODO: // 任务入口处创建一次，携带 taskId / batchId / bookId
const emitter = new CollectEventEmitter(this.#eventManager, {
    taskId,
    batchId: payload.batchId,
    ctx: { bookId: payload.bookId },
});

// 使用时非常简洁
emitter.start(COLLECT_EVENTS.UPDATE_CHAPTER_START, {
    ctx: { chapterId },
    message: `开始更新第 ${chapterId} 章`,
});

emitter.success(COLLECT_EVENTS.UPDATE_CHAPTER, {
    ctx: { chapterId },
    message: '已完成章节采集',
});

emitter.failure(COLLECT_EVENTS.UPDATE_CHAPTER, {
    ctx: { chapterId },
    error: err,
    message: '章节采集失败',
});

*/