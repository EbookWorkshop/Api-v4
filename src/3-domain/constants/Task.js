export const TASK_TYPES = {
    EXPORT_BOOK: 'EXPORT_BOOK',
    WEB_BOOK_COLLECT: 'WEB_BOOK_COLLECT',
};

export const TASK_MESSAGE_TYPE = {
    TASK_ERROR: "TASK_ERROR",
    TASK_COMPLETED: "TASK_COMPLETED",
};

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