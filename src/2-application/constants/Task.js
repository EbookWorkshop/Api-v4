/**
 * 多线程相关的常量定义
 * 将发送到子线程，不能用Symbol
 */

/**
 * @typedef {'EXPORT_BOOK' | 'WEB_BOOK_COLLECT' | 'WEB_BOOK_UPDATE_INDEX'
 *   | 'WEB_BOOK_CHAPTER_COLLECT' | 'SINGLE_CHAPTER_COLLECT'
 *   | 'SYSTEM_VERSION' | 'BOTRULE_VIS' | 'COMPRESS_DATABASE' | 'COMMAND'} TaskType
 * @typedef {typeof TASK_STATUS[keyof typeof TASK_STATUS]} TaskStatus
 */

export const TASK_TYPES = {
    EXPORT_BOOK: 'EXPORT_BOOK',
    WEB_BOOK_COLLECT: 'WEB_BOOK_COLLECT',
    WEB_BOOK_UPDATE_INDEX: "WEB_BOOK_UPDATE_INDEX",
    WEB_BOOK_CHAPTER_COLLECT: 'WEB_BOOK_CHAPTER_COLLECT',
    SINGLE_CHAPTER_COLLECT: 'SINGLE_CHAPTER_COLLECT',
    WEB_BOOK_CRAWLER: 'WEB_BOOK_CRAWLER',       //爬虫模式：从某一章开始逐一记录
    WEB_BOOK_AUTO_SYNC_CHAPTER: "WEB_BOOK_AUTO_SYNC_CHAPTER",
    WEB_BOOK_AUTO_SYNC_INDEX: "WEB_BOOK_AUTO_SYNC_INDEX",

    WEB_BOOK_LIST_CACHE: "WEB_BOOK_LIST_CACHE",
    UPDATE_BOOK_WORD: "UPDATE_BOOK_WORD",
    SYSTEM_VERSION: "SYSTEM_VERSION",
    BOTRULE_VIS: "BOTRULE_VIS",//预览规则
    COMPRESS_DATABASE: "COMPRESS_DATABASE",//压缩数据库
    COMMAND: "COMMAND", //控制命令
    STORAGE_COVER_COLLECT: 'STORAGE_COVER_COLLECT',//更新书本封面
    STORAGE_COVER_CACHE: 'STORAGE_COVER_CACHE',   // 封面本地化缓存
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
    /** 已重试 */
    RETRY: "retry",
}