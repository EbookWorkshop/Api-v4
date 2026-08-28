import { EXPORT_EVENTS } from "../../3-domain/constants/Event.js";

/**
 * 导出任务编排器
 */
export class ExportOrchestrator {
    #eventMgr;
    #config;
    constructor(eventMgr, config) {
        this.#eventMgr = eventMgr;
        this.#config = config;

        // 监听文件生成事件，根据配置分发后续任务
        this.#eventMgr.on(EXPORT_EVENTS.FILE_GENERATED, this.#onFileGenerated.bind(this));
    }

    /**
     * 
     * @param {{ bookId, setting, result, error }} event 
     */
    async #onFileGenerated(event) {
        const { bookId, bookName, format, setting, result: genRsl, error } = event.payload;
        const { filename, path: filepath, result, warnings } = genRsl;
        const files = [{ filename: filename, originalFilename: `${bookName}.${format}`, filepath }];

        if (error) return;//生成失败了

        // 1. 根据配置决定是否发邮件
        if (setting.sendByEmail) this.#eventMgr.emit(EXPORT_EVENTS.MAIL_SENT, { files, version: this.#config.version });

        // 2. 根据配置决定是否转存到库存
        if (setting.isExportToInventory) this.#eventMgr.emit(EXPORT_EVENTS.INVENTORY_ARCHIVE, { files });

        // 3. 无论成功失败，最终都要清理临时文件
        // 可以用一个延迟事件，等所有任务完成后再清理
        // 或者 FILE_GENERATED 后立即调度清理，但设置一个延迟
        this.#eventMgr.emit(EXPORT_EVENTS.TEMP_CLEANUP, {
            filePath: filepath,
            delay: 60_000 // 1分钟后清理
        });
    }
}