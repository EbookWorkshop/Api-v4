export class TempFileCleaner {
    #fileWriter;
    #scheduler;
    #logger;

    /**
     * @param {Object} deps
     * @param {import('../../../ports/IFileWriter.js').IFileWriter} deps.fileWriter
     * @param {import('./TimerScheduler.js').TimerScheduler} deps.scheduler
     * @param {Console} [deps.logger]
     */
    constructor({ fileWriter, scheduler, logger = console }) {
        this.#fileWriter = fileWriter;
        this.#scheduler = scheduler;
        this.#logger = logger;
    }

    /**
     * 延时清理临时文件
     * @param {string} filePath
     * @param {number} delay
     */
    async cleanup(filePath, delay = 0) {
        if (!filePath) return;

        await this.#scheduler.delay(delay);

        try {
            await this.#fileWriter.deleteFile(filePath, true);
        } catch (err) {
            this.#logger.warn('[TempFileCleaner] 临时文件清理失败', {
                filePath,
                err,
            });
        }
    }
}