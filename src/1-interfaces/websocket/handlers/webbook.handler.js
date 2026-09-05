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
    // 订阅/取消订阅书籍房间
    socket.on('subscribe:book', (bookId) => { if (bookId) socket.join(`book-${bookId}`); });
    socket.on('unsubscribe:book', (bookId) => { if (bookId) socket.leave(`book-${bookId}`); });

    //#region 暂未接入前端的socket协议
    // 客户端触发创建网文
    socket.on('webBook:create', async (payload, callback) => {
        try {
            const result = await services.task.submitCreateWebBookTask(payload);
            callback({ success: true, taskId: result.taskId });
        } catch (err) {
            callback({ success: false, message: err.message });
        }
    });

    // 客户端触发更新目录
    socket.on('webBook:updateIndex', async (payload, callback) => {
        try {
            const result = await services.task.submitUpdateIndex(payload);
            callback({ success: true, taskId: result.taskId });
        } catch (err) {
            callback({ success: false, message: err.message });
        }
    });

    // 客户端触发单章更新
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
    // 创建书籍完成
    eventManager.on(COLLECT_EVENTS.CREATE_BOOK, (payload) => {
        // io.to(`book-${payload.bookId}`)
        io.emit('WebBook.Create.Finish', {
            bookId: payload.bookId,
            bookName: payload.bookName,
            success: payload.success,
            message: payload.message,
        });
    });

    // 更新目录完成
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

    // 单章更新（进度或完成）
    eventManager.on(COLLECT_EVENTS.UPDATE_CHAPTER, (payload) => {
        const room = `book-${payload.bookId}`;
        if (payload.isFinish !== undefined) {
            // 完成事件
            io.to(room).emit(`WebBook.Chapter.Update`, {
                chapterId: payload.chapterId,
                title: payload.title,
                success: payload.success,
                message: payload.message,
            });
        } else {
            // 进度事件
            io.to(room).emit(`WebBook.UpdateChapter.Process`, {
                chapterId: payload.chapterId,
                rate: payload.rate || 0,
                done: payload.done || 0,
                total: payload.total || 0,
                message: payload.message,
            });
        }
    });

    // 批量更新完成
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