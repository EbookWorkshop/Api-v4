import { COLLECT_EVENTS } from '../../../2-application/constants/Event.js';
import { Message } from "../../../5-shared/dtos/Message.dto.js"

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
            // 阶段 2 之后，submitUpdateChapters 返回 { batchId, total, taskIds, message }
            callback({
                success: true,
                batchId: result.batchId,
                total: result.total,
                taskIds: result.taskIds,
            });
        } catch (err) {
            callback({ success: false, message: err.message });
        }
    });
    //#endregion
}

/**
 * 注册全局广播（启动时执行一次）
 * 监听 eventManager 上的事件，转发到对应的房间
 *
 * 所有采集事件均使用统一信封：
 *   { event, taskId?, batchId?, ctx, ok, data?, error?, message?, ts }
 *
 * 接收端处理原则：
 *   1. 先处理人类可读消息（env.message）
 *   2. 再按 env.ok 分支：成功读 env.data，失败读 env.error
 *   3. 业务标识统一从 env.ctx 取，不再有深层嵌套
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
    eventManager.on(COLLECT_EVENTS.CREATE_BOOK, (env) => {
        if (!env.ok) {
            return eventManager.messageToClient(new Message(
                `${env.error.message}\n采集来源：${env.ctx.sourcePage || '未知'}`,
                "notice",
                {
                    title: env.message || "创建书籍失败",
                    avatar: "error",
                }
            ));
        }

        const { bookId, bookName } = env.data;
        io.emit('WebBook.Create.Finish', {
            bookId,
            bookName,
            message: env.message,
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
     *           message:
     *             type: string
     *         required:
     *           - bookId
     *           - success
     */
    eventManager.on(COLLECT_EVENTS.UPDATE_INDEX, (env) => {
        const { bookId, bookName } = env.ctx;

        if (!env.ok) {
            return eventManager.messageToClient(new Message(
                env.message || env.error.message,
                "notice",
                {
                    title: `书籍《${bookName || bookId}》更新目录失败！`,
                    avatar: "error",
                }
            ));
        }

        io.emit('WebBook.UpdateIndex.Finish', {
            bookId,
            bookName,
            addedCount: env.data?.addedCount || 0,
            message: env.message,
        });
    });

    /**
     * @asyncapi
     * channels:
     *   web-book-chapter-update-start:
     *     address: WebBook.UpdateOneChapter.Start
     *     messages:
     *       chapterUpdateStart:
     *         $ref: '#/components/messages/WebBookChapterUpdateStart'
     * operations:
     *   webBookChapterUpdateStart:
     *     action: send
     *     channel:
     *       $ref: '#/channels/web-book-chapter-update-start'
     */
    eventManager.on(COLLECT_EVENTS.UPDATE_CHAPTER_START, (env) => {
        const { bookId, chapterId } = env.ctx;
        const room = `book-${bookId}`;
        io.to(room).emit('WebBook.UpdateOneChapter.Start', { chapterId, bookId });
    });

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
     *             type: number
     *           bookId:
     *             type: number
     *         required:
     *           - chapterId
     */
    eventManager.on(COLLECT_EVENTS.UPDATE_CHAPTER, (env) => {
        const { bookId, chapterId } = env.ctx;
        const room = `book-${bookId}`;

        if (!env.ok) {
            return io.to(room).emit('WebBook.UpdateOneChapter.Error', {
                chapterId,
                err: env.error,
            });
        }

        io.to(room).emit('WebBook.Chapter.Update', { bookId, chapterId });
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
    eventManager.on(COLLECT_EVENTS.UPDATE_CHAPTER_BATCH_FINISH, (env) => {
        const { bookId, bookName } = env.ctx;
        const batchId = env.batchId;
        const data = env.data || {};
        io.emit('WebBook.UpdateChapter.Finish', {
            batchId,
            bookId,
            bookName,
            chapterIds: data.chapterIds || [],
            doneNum: data.doneNum || 0,
            failNum: data.failNum || 0,
            total: data.total || 0,
            status: data.status || 'completed',
        });
    });

    /**
     * @asyncapi
     * channels:
     *   web-book-update-chapter-progress:
     *     address: WebBook.UpdateChapter.Progress
     *     messages:
     *       updateChapterProgress:
     *         $ref: '#/components/messages/WebBookUpdateChapterProgress'
     * operations:
     *   webBookUpdateChapterProgress:
     *     action: send
     *     channel:
     *       $ref: '#/channels/web-book-update-chapter-progress'
     * components:
     *   messages:
     *     WebBookUpdateChapterProgress:
     *       summary: 批量章节更新进度广播（发送到对应书籍房间）。
     *       payload:
     *         type: object
     *         properties:
     *           batchId:
     *             type: string
     *           bookId:
     *             type: number
     *           bookName:
     *             type: string
     *           total:
     *             type: number
     *           done:
     *             type: number
     *           success:
     *             type: number
     *           fail:
     *             type: number
     *           percent:
     *             type: number
     *           status:
     *             type: string
     *         required:
     *           - batchId
     *           - total
     *           - done
     */
    eventManager.on(COLLECT_EVENTS.UPDATE_CHAPTER_BATCH_PROGRESS, (env) => {
        const { bookId, bookName } = env.ctx;
        const batchId = env.batchId;                     // ← 从顶层取
        const data = env.data || {};

        io.to(`book-${bookId}`).emit('WebBook.UpdateChapter.Progress', {
            batchId,
            bookId,
            bookName,
            total: data.total || 0,
            done: data.done || 0,
            success: data.success || 0,
            fail: data.fail || 0,
            percent: data.percent || 0,
            status: data.status || 'running',
        });
    });

    /**
     * @asyncapi
     * channels:
     *   web-book-fetch-chapter:
     *     address: WebBook.FetchChapter
     *     messages:
     *       fetchChapter:
     *         $ref: '#/components/messages/WebBookFetchChapter'
     * operations:
     *   webBookFetchChapter:
     *     action: send
     *     channel:
     *       $ref: '#/channels/web-book-fetch-chapter'
     */
    eventManager.on(COLLECT_EVENTS.FETCH_CHAPTER, (env) => {
        const { url } = env.ctx;

        if (!env.ok) {
            return eventManager.messageToClient(new Message(
                `${env.message}\n来源：${url || '未知'}`,
                "notice",
                {
                    title: '单章采集失败',
                    avatar: "error",
                }
            ));
        }

        const { filePath, fileName } = env.data || {};
        return eventManager.messageToClient(new Message(
            `${env.message}\n\n${filePath || ''}`,
            "notice",
            {
                subTitle: fileName,
                title: '单章采集成功',
                avatar: "success",
            }
        ));
    });

    /**
     * 兜底：采集任务初始化阶段失败（未进入任何 Collector 分支）
     */
    eventManager.on(COLLECT_EVENTS.UNKNOW, (env) => {
        console.warn('[采集任务初始化失败]', env.message);
        console.warn('[错误]', env.error);
        console.warn('[上下文]', env.ctx);
    });
}