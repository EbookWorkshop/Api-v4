import { EXPORT_EVENTS } from "../../constants/Event.js";
import { Message } from "../../../5-shared/dtos/Message.dto.js";
import { logger } from "../../../5-shared/logging/index.js";

export class ExportOrchestrator {
    #eventMgr;
    #config;
    #inventoryArchiver;
    #tempFileCleaner;
    #bookmarkRecorder;
    #scheduler;

    #boundOnFileGenerated;
    #boundOnLastChapter;

    /**
     * @param {import('../../../4-infrastructure/event/EventManager.js').EventManager} eventMgr
     * @param {Object} config
     * @param {Object} deps
     * @param {import('./postprocess/InventoryArchiver.js').InventoryArchiver} deps.inventoryArchiver
     * @param {import('./postprocess/TempFileCleaner.js').TempFileCleaner} deps.tempFileCleaner
     * @param {import('./postprocess/BookmarkRecorder.js').BookmarkRecorder} deps.bookmarkRecorder
     * @param {import('./postprocess/TimerScheduler.js').TimerScheduler} deps.scheduler
     */
    constructor(eventMgr, config, {
        inventoryArchiver,
        tempFileCleaner,
        bookmarkRecorder,
        scheduler,
    }) {
        this.#eventMgr = eventMgr;
        this.#config = config;
        this.#inventoryArchiver = inventoryArchiver;
        this.#tempFileCleaner = tempFileCleaner;
        this.#bookmarkRecorder = bookmarkRecorder;
        this.#scheduler = scheduler;

        this.#boundOnFileGenerated = this.#onFileGenerated.bind(this);
        this.#boundOnLastChapter = this.#onLastChapter.bind(this);

        // 监听文件生成完成
        this.#eventMgr.on(EXPORT_EVENTS.FILE_GENERATED, this.#boundOnFileGenerated);
        // 监听“部分导出最后一章”，由编排器直接记录书签
        this.#eventMgr.on(EXPORT_EVENTS.Export_Last_Chapter, this.#boundOnLastChapter);
    }

    async #onFileGenerated(event) {
        const { bookId, bookName, format, setting, result: genRsl, error } = event.payload;

        if (error) {
            this.#eventMgr.messageToClient(new Message(
                "生成书籍任务失败，原因：" + error.message,
                "notice",
                {
                    title: `${bookId}《${bookName}》生成${format}失败`,
                    avatar: "error",
                    subTitle: format,
                }
            ));
            return;
        }

        const { filename, path: filepath, result, warnings } = genRsl;
        const files = [{
            filename,
            originalFilename: `${bookName}.${format}`,
            filepath,
        }];
        const jobDone = [`已生成图书《${bookName}》 result:${result}`];

        // 1. 邮件：仍走事件，由 EmailService 自己监听 MAIL_SENT
        if (setting.sendByEmail) {
            this.#eventMgr.emit(EXPORT_EVENTS.MAIL_SENT, {
                files,
                version: this.#config.version,
            });
            jobDone.push("已尝试发送邮件");
        }

        // 2. 转存：由编排器直接调用后处理服务
        if (setting.isExportToInventory) {
            this.#inventoryArchiver
                .archive(files, 30_000)
                .catch(err => {
                    logger.error('[ExportOrchestrator] 转存到库存失败', err);
                });
            jobDone.push("已尝试转存到库存");
        }

        // 3. 临时文件清理：由编排器直接调用后处理服务
        this.#tempFileCleaner
            .cleanup(filepath, 60_000)
            .catch(err => {
                logger.warn('[ExportOrchestrator] 清理临时文件失败', err);
            });
        jobDone.push("将进行临时文件清理");

        if (warnings?.length > 0) {
            jobDone.push("\n\n以下为生成警告：", ...warnings);
        }

        this.#eventMgr.messageToClient(new Message(
            jobDone.join("…\n"),
            "notice",
            {
                title: `生成《${bookName}》成功`,
                avatar: "success",
                subTitle: format,
            }
        ));
    }

    async #onLastChapter({ id }) {
        try {
            await this.#bookmarkRecorder.record(id);
        } catch (err) {
            logger.error('[ExportOrchestrator] 记录最后一章书签失败', err);
        }
    }

    async close() {
        // NOTE: 虽然挂着等定时器生效。但线程池每60s会清理空闲线程，存在误关闭的风险
        await this.#scheduler?.waitAll();   // 等转存/清理跑完
        this.#eventMgr.off(EXPORT_EVENTS.FILE_GENERATED, this.#boundOnFileGenerated);
        this.#eventMgr.off(EXPORT_EVENTS.Export_Last_Chapter, this.#boundOnLastChapter);
    }
}