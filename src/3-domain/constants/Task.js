/**
 * 多线程相关的常量定义
 */

/**
 * 子线程任务类型
 */
export const TASK_TYPES = {
    EXPORT_BOOK: 'EXPORT_BOOK',
    WEB_BOOK_COLLECT: 'WEB_BOOK_COLLECT',
    WEB_BOOK_CHAPTER_COLLECT: 'WEB_BOOK_CHAPTER_COLLECT',
    SINGLE_CHAPTER_COLLECT: 'SINGLE_CHAPTER_COLLECT',
};

/**
 * 父、子线程通讯消息类型
 */
export const TASK_MESSAGE_TYPE = {
    TASK_ERROR: "TASK_ERROR",
    TASK_COMPLETED: "TASK_COMPLETED",
    TASK_EVENT_ENVELOPE: "TASK_CrossThreadEventEnvelope",
};

/**
 * 子线程任务执行状态
 */
export const TASK_STATUS = {
    /** 待定 */
    PENDING: "pending",
    /** 执行中 */
    EXECUTING: "executing",
    /** 已兑现 */
    FULFILLED: "fulfilled",
    /** 已拒绝 */
    REJECTED: "rejected",
}