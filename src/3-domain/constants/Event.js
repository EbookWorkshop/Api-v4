/**
 *  # NOTE:  若需要支持跨线程的消息，不能使用Symbol定义！
 * 
 *     Symbol("a")!==Symbol("a")
 *     Symbol.for("a")===Symbol.for("a")
 */



/**
 * 通过消息新增一个线程任务
 */
export const WORKERPOOL_ADD_TASK = Symbol("WorkerPool.Add.Task");


export const MAIL_SENT = Symbol('mail.sent')


/**
 * 导出图书功能事件簇
 */
export const EXPORT_EVENTS = {
    // 文件生成相关
    /** 文件生成完成-含生成失败 */
    FILE_GENERATED: Symbol('file.generated'),      // BookExportService 发出
    /** 文件转存完成 */
    FILE_COPIED: Symbol('file.copied'),            // InventoryService 发出
    /** 文件删除完成 */
    FILE_DELETED: Symbol('file.deleted'),          // FileService 发出

    // 邮件相关
    MAIL_SEND: Symbol('mail.send'),                // 配置驱动的 Orchestrator
    MAIL_SENT: MAIL_SENT,                          // EmailService 发出
    MAIL_FAILED: Symbol('mail.failed'),            // EmailService 发出

    // 库存相关
    INVENTORY_ARCHIVE: Symbol('inventory.archive'), // 触发转存
    INVENTORY_ARCHIVED: Symbol('inventory.archived'),

    // 清理相关
    TEMP_CLEANUP: Symbol('temp.cleanup'),
    TEMP_CLEANED: Symbol('temp.cleaned'),
};