import { EventEmitter } from 'node:events';

import { ITaskExecutor } from "../ports/ITaskExecutor.js";
import { EXPORT_EVENTS } from '../constants/Event.js';
import { BookExportExecutor } from "../services/executor/BookExportExecutor.js";
import { BookExportService } from "../services/BookExportService.js";
import { BookQueryService } from "../services/BookQueryService.js";
import { VolumeQueryService } from "../services/VolumeQueryService.js"
import { ChapterQueryService } from "../services/ChapterQueryService.js";
import { CoverService } from '../services/CoverService.js';
import { TextCleanupService } from '../services/TextCleanupService.js';
import { SystemConfigService } from "../services/SystemConfigService.js";

import { MemoryCache } from '../../4-infrastructure/cache/MemoryCache.js';
import { EventManager } from "../../4-infrastructure/event/EventManager.js";
import { FileSystemWriter } from "../../4-infrastructure/server/adapters/FileSystemWriter.js";
import { GeneratorFactory } from '../../4-infrastructure/server/generators/GeneratorFactory.js';

import { EmailService } from '../services/EmailService.js';
import { NodemailerEmailSender } from "../../4-infrastructure/email/NodemailerEmailSender.js";
import { ExportOrchestrator } from "../orchestrators/ExportOrchestrator.js";


/** 
 * 负责组装出导出器
 * @param {Object} config 配置
 * @param {TASK_TYPES} taskType 任务类型
 * @param {Object} repositories 线程/服务器资源
 * @returns {ITaskExecutor}
 */
export async function createExportBookTask(config, taskType, { repositories }) {
    const { ebookRepository, volumeRepository, chapterRepository, reviewRuleRepository } = repositories;
    const bookServ = new BookQueryService(ebookRepository);
    const chapServ = new ChapterQueryService(chapterRepository);
    const volumeServ = new VolumeQueryService(volumeRepository);

    const fileServ = new FileSystemWriter(config.repository?.path);
    const tempFolder = await fileServ.accessDir(config.tempDir?.path);
    const factory = new GeneratorFactory(tempFolder);
    const coverService = new CoverService(fileServ, null, config);
    const eventMgr = new EventManager(new EventEmitter());
    const textCleanup = new TextCleanupService(reviewRuleRepository, new MemoryCache());
    const systemConfigService = new SystemConfigService(repositories.systemConfigRepository);


    //注册监听后处理事件
    eventMgr.on(EXPORT_EVENTS.INVENTORY_ARCHIVE, async ({ files }) => {   //转存
        for (const ff of files) await fileServ.moveFile(ff.filepath, [config.archive.path, ff.originalFilename]);
    });
    eventMgr.on(EXPORT_EVENTS.TEMP_CLEANUP, (param) => {    //清理文件
        const { filePath, delay } = param;
        if (filePath) setTimeout(async () => { try { await fileServ.deleteFile(filePath); } catch (e) { } }, delay || 0);
    });
    new EmailService(new NodemailerEmailSender(), systemConfigService, null, eventMgr);//注册邮件发送事件
    new ExportOrchestrator(eventMgr, config);//注册文件生成完成事件

    const bookExpServ = new BookExportService({
        book: bookServ,
        volume: volumeServ,
        chapter: chapServ,
    }, factory, fileServ, coverService, textCleanup, eventMgr, config);
    return new BookExportExecutor(bookExpServ);
}
export default createExportBookTask;