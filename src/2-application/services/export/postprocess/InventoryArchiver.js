import { logger as appLogger } from '../../../../5-shared/logging/index.js';
export class InventoryArchiver {
    #fileWriter;
    #archivePath;
    #scheduler;
    #logger;

    /**
     * @param {Object} deps
     * @param {import('../../../ports/IFileWriter.js').IFileWriter} deps.fileWriter
     * @param {string} deps.archivePath
     * @param {import('./TimerScheduler.js').TimerScheduler} deps.scheduler
     * @param {*} [deps.logger]
     */
    constructor({ fileWriter, archivePath, scheduler, logger = appLogger }) {
        this.#fileWriter = fileWriter;
        this.#archivePath = archivePath;
        this.#scheduler = scheduler;
        this.#logger = logger;
    }

    /**
     * 延时转存到库存
     * @param {Array<{ filepath: string, originalFilename: string }>} files
     * @param {number} delay
     */
    async archive(files, delay = 0) {
        await this.#scheduler.delay(delay);

        for (const ff of files) {
            try {
                await this.#fileWriter.moveFile(ff.filepath, [
                    this.#archivePath,
                    ff.originalFilename,
                ]);
            } catch (err) {
                this.#logger.error('[InventoryArchiver] 转存失败', {
                    file: ff,
                    err,
                });
            }
        }
    }
}