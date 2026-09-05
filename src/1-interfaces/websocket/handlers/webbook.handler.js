import { COLLECT_EVENTS } from '../../../3-domain/constants/Event.js';

/**
 * 注册客户端发起的请求（每个连接独立）
 * 
 *  客户端通过订阅监听本房间内的所有信息，离开页面时取消订阅，可以实现具体网页响应不同的事件：    
 *  // ==========前端 订阅/取消订阅 ==========    
 * function subscribeBook(bookId) {    socket.emit('subscribe:book', bookId);}    
 * function unsubscribeBook(bookId) {    socket.emit('unsubscribe:book', bookId);}    
 */
export function registerSocketEvents(socket, services, eventManager) {
    /**
     * @asyncapi
     * channels:
     *   subscribe-book:
     *     address: subscribe:book
     *     messages:
     *       subscribeRequest:
     *         $ref: '#/components/messages/SubscribeRequest'
     * operations:
     *   subscribeBook:
     *     action: receive
     *     channel:
     *       $ref: '#/channels/subscribe-book'
     * components:
     *   messages:
     *     SubscribeRequest:
     *       summary: 客户端订阅书籍房间，传入书籍ID。
     *       payload:
     *         type: string
     *         description: 书籍ID
     *         example: "123"
     */
    socket.on('subscribe:book', (bookId) => { if (bookId) socket.join(`book-${bookId}`); });
    /**
     * @asyncapi
     * channels:
     *   unsubscribe-book:
     *     address: unsubscribe:book
     *     messages:
     *       unsubscribeRequest:
     *         $ref: '#/components/messages/UnsubscribeRequest'
     * operations:
     *   unsubscribeBook:
     *     action: receive
     *     channel:
     *       $ref: '#/channels/unsubscribe-book'
     * components:
     *   messages:
     *     UnsubscribeRequest:
     *       summary: 客户端取消订阅书籍房间，传入书籍ID。
     *       payload:
     *         type: string
     *         description: 书籍ID
     *         example: "123"
     */
    socket.on('unsubscribe:book', (bookId) => { if (bookId) socket.leave(`book-${bookId}`); });

    //#region 暂未接入前端的socket协议
    /**
     * @asyncapi
     * channels:
     *   web-book-create:
     *     address: webBook:create
     *     messages:
     *       createRequest:
     *         $ref: '#/components/messages/WebBookCreateRequest'
     *       createResponse:
     *         $ref: '#/components/messages/WebBookCreateResponse'
     * operations:
     *   webBookCreate:
     *     action: receive
     *     channel:
     *       $ref: '#/channels/web-book-create'
     *     reply:
     *       channel:
     *         $ref: '#/channels/web-book-create'
     *       messages:
     *         - $ref: '#/components/messages/WebBookCreateResponse'
     * components:
     *   messages:
     *     WebBookCreateRequest:
     *       summary: 客户端请求创建网文任务，传入创建参数。
     *       payload:
     *         type: object
     *         properties: {}
     *         description: 创建书籍所需参数（具体结构待补充）
     *     WebBookCreateResponse:
     *       summary: 创建任务响应，返回任务ID。
     *       payload:
     *         type: object
     *         properties:
     *           success:
     *             type: boolean
     *           taskId:
     *             type: string
     *             description: 任务ID
     *         required:
     *           - success
     */
    socket.on('webBook:create', async (payload, callback) => {
        try {
            const result = await services.task.submitCreateWebBookTask(payload);
            callback({ success: true, taskId: result.taskId });
        } catch (err) {
            callback({ success: false, message: err.message });
        }
    });

    /**
     * @asyncapi
     * channels:
     *   web-book-update-index:
     *     address: webBook:updateIndex
     *     messages:
     *       updateIndexRequest:
     *         $ref: '#/components/messages/WebBookUpdateIndexRequest'
     *       updateIndexResponse:
     *         $ref: '#/components/messages/WebBookUpdateIndexResponse'
     * operations:
     *   webBookUpdateIndex:
     *     action: receive
     *     channel:
     *       $ref: '#/channels/web-book-update-index'
     *     reply:
     *       channel:
     *         $ref: '#/channels/web-book-update-index'
     *       messages:
     *         - $ref: '#/components/messages/WebBookUpdateIndexResponse'
     * components:
     *   messages:
     *     WebBookUpdateIndexRequest:
     *       summary: 客户端请求更新目录任务。
     *       payload:
     *         type: object
     *         properties: {}
     *         description: 更新目录所需参数（具体结构待补充）
     *     WebBookUpdateIndexResponse:
     *       summary: 更新目录任务响应，返回任务ID。
     *       payload:
     *         type: object
     *         properties:
     *           success:
     *             type: boolean
     *           taskId:
     *             type: string
     *         required:
     *           - success
     */
    socket.on('webBook:updateIndex', async (payload, callback) => {
        try {
            const result = await services.task.submitUpdateIndex(payload);
            callback({ success: true, taskId: result.taskId });
        } catch (err) {
            callback({ success: false, message: err.message });
        }
    });

    /**
     * @asyncapi
     * channels:
     *   web-book-update-chapter:
     *     address: webBook:updateChapter
     *     messages:
     *       updateChapterRequest:
     *         $ref: '#/components/messages/WebBookUpdateChapterRequest'
     *       updateChapterResponse:
     *         $ref: '#/components/messages/WebBookUpdateChapterResponse'
     * operations:
     *   webBookUpdateChapter:
     *     action: receive
     *     channel:
     *       $ref: '#/channels/web-book-update-chapter'
     *     reply:
     *       channel:
     *         $ref: '#/channels/web-book-update-chapter'
     *       messages:
     *         - $ref: '#/components/messages/WebBookUpdateChapterResponse'
     * components:
     *   messages:
     *     WebBookUpdateChapterRequest:
     *       summary: 客户端请求批量章更新任务，包含章节ID列表等。
     *       payload:
     *         type: object
     *         properties:
     *           chapterIds:
     *             type: array
     *             items:
     *               type: string
     *             description: 需要更新的章节ID列表
     *         description: 更多参数参见实际实现
     *     WebBookUpdateChapterResponse:
     *       summary: 单章更新任务响应，返回任务ID。
     *       payload:
     *         type: object
     *         properties:
     *           success:
     *             type: boolean
     *           taskId:
     *             type: string
     *         required:
     *           - success
     */
    socket.on('webBook:updateChapter', async (payload, callback) => {
        try {
            const result = await services.task.submitUpdateChapters(payload.chapterIds, payload);
            callback({ success: true, taskId: result.taskId });
        } catch (err) {
            callback({ success: false, message: err.message });
        }
    });
    //#endregion
}

/**
 * 注册全局广播（启动时执行一次）
 * 监听 eventManager 上的事件，转发到对应的房间
 */
export function registerGlobalBroadcasts(io, services, eventManager) {
    /**
     * @asyncapi
     * channels:
     *   web-book-create-finish:
     *     address: WebBook.Create.Finish
     *     messages:
     *       createFinish:
     *         $ref: '#/components/messages/WebBookCreateFinish'
     * operations:
     *   webBookCreateFinish:
     *     action: send
     *     channel:
     *       $ref: '#/channels/web-book-create-finish'
     * components:
     *   messages:
     *     WebBookCreateFinish:
     *       summary: 书籍创建完成广播（全局）。
     *       payload:
     *         type: object
     *         properties:
     *           bookId:
     *             type: string
     *           bookName:
     *             type: string
     *           success:
     *             type: boolean
     *           message:
     *             type: string
     *         required:
     *           - bookId
     *           - success
     */
    eventManager.on(COLLECT_EVENTS.CREATE_BOOK, (payload) => {
        // io.to(`book-${payload.bookId}`)
        io.emit('WebBook.Create.Finish', {
            bookId: payload.bookId,
            bookName: payload.bookName,
            success: payload.success,
            message: payload.message,
        });
    });

    /**
     * @asyncapi
     * channels:
     *   web-book-update-index-finish:
     *     address: WebBook.UpdateIndex.Finish
     *     messages:
     *       updateIndexFinish:
     *         $ref: '#/components/messages/WebBookUpdateIndexFinish'
     * operations:
     *   webBookUpdateIndexFinish:
     *     action: send
     *     channel:
     *       $ref: '#/channels/web-book-update-index-finish'
     * components:
     *   messages:
     *     WebBookUpdateIndexFinish:
     *       summary: 目录更新完成广播（全局）。
     *       payload:
     *         type: object
     *         properties:
     *           bookId:
     *             type: string
     *           bookName:
     *             type: string
     *           addedCount:
     *             type: number
     *           success:
     *             type: boolean
     *           message:
     *             type: string
     *         required:
     *           - bookId
     *           - success
     */
    eventManager.on(COLLECT_EVENTS.UPDATE_INDEX, (payload) => {
        // io.to(`book-${payload.bookId}`).
        io.emit('WebBook.UpdateIndex.Finish', {
            bookId: payload.bookId,
            bookName: payload.bookName,
            addedCount: payload.addedCount || 0,
            success: payload.success,
            message: payload.message,
        });
    });

    eventManager.on(COLLECT_EVENTS.UPDATE_CHAPTER, (payload) => {
        const room = `book-${payload.bookId}`;
        if (payload.isFinish !== undefined) {
            /**
             * @asyncapi
             * channels:
             *   web-book-chapter-update:
             *     address: WebBook.Chapter.Update
             *     messages:
             *       chapterUpdate:
             *         $ref: '#/components/messages/WebBookChapterUpdate'
             * operations:
             *   webBookChapterUpdate:
             *     action: send
             *     channel:
             *       $ref: '#/channels/web-book-chapter-update'
             * components:
             *   messages:
             *     WebBookChapterUpdate:
             *       summary: 批量任务，单章更新完成广播（发送到对应书籍房间）。
             *       payload:
             *         type: object
             *         properties:
             *           chapterId:
             *             type: string
             *           title:
             *             type: string
             *           success:
             *             type: boolean
             *           message:
             *             type: string
             *         required:
             *           - chapterId
             *           - success
             */
            io.to(room).emit(`WebBook.Chapter.Update`, {
                chapterId: payload.chapterId,
                title: payload.title,
                success: payload.success,
                message: payload.message,
            });
        } else {
            /**
             * @asyncapi
             * channels:
             *   web-book-update-chapter-process:
             *     address: WebBook.UpdateChapter.Process
             *     messages:
             *       updateChapterProcess:
             *         $ref: '#/components/messages/WebBookUpdateChapterProcess'
             * operations:
             *   webBookUpdateChapterProcess:
             *     action: send
             *     channel:
             *       $ref: '#/channels/web-book-update-chapter-process'
             * components:
             *   messages:
             *     WebBookUpdateChapterProcess:
             *       summary: 单章更新进度广播（发送到对应书籍房间）。
             *       payload:
             *         type: object
             *         properties:
             *           chapterId:
             *             type: string
             *           rate:
             *             type: number
             *             description: 进度百分比
             *           done:
             *             type: number
             *             description: 已完成数量
             *           total:
             *             type: number
             *             description: 总数量
             *           message:
             *             type: string
             *         required:
             *           - chapterId
             */
            io.to(room).emit(`WebBook.UpdateChapter.Process`, {
                chapterId: payload.chapterId,
                rate: payload.rate || 0,
                done: payload.done || 0,
                total: payload.total || 0,
                message: payload.message,
            });
        }
    });

    /**
     * @asyncapi
     * channels:
     *   web-book-update-chapter-finish:
     *     address: WebBook.UpdateChapter.Finish
     *     messages:
     *       updateChapterFinish:
     *         $ref: '#/components/messages/WebBookUpdateChapterFinish'
     * operations:
     *   webBookUpdateChapterFinish:
     *     action: send
     *     channel:
     *       $ref: '#/channels/web-book-update-chapter-finish'
     * components:
     *   messages:
     *     WebBookUpdateChapterFinish:
     *       summary: 批量章节更新完成广播（全局）。
     *       payload:
     *         type: object
     *         properties:
     *           bookId:
     *             type: string
     *           bookName:
     *             type: string
     *           chapterIds:
     *             type: array
     *             items:
     *               type: string
     *           doneNum:
     *             type: number
     *           failNum:
     *             type: number
     *         required:
     *           - bookId
     *           - doneNum
     *           - failNum
     */
    eventManager.on(COLLECT_EVENTS.UPDATE_CHAPTER_BATCH_FINISH, (payload) => {
        // io.to(`book-${payload.bookId}`)
        io.emit(`WebBook.UpdateChapter.Finish`, {
            bookId: payload.bookId,
            bookName: payload.bookName,
            chapterIds: payload.chapterIds || [],
            doneNum: payload.doneNum || 0,
            failNum: payload.failNum || 0,
        });
    });
}