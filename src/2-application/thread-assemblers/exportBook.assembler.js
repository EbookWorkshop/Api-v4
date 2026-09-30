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
import { FileSystemScanner } from "../../4-infrastructure/server/adapters/FileSystemScanner.js";
import { FileSystemWriter } from "../../4-infrastructure/server/adapters/FileSystemWriter.js";
import { GeneratorFactory } from '../../4-infrastructure/server/generators/GeneratorFactory.js';

import { EmailService } from '../services/EmailService.js';
import { NodemailerEmailSender } from "../../4-infrastructure/email/NodemailerEmailSender.js";
import { ExportOrchestrator } from "../orchestrators/ExportOrchestrator.js";


/** 
 * 负责组装出导出器
 * @param {Object} config 配置
 * @param {import("../constants/Task.js").TaskType} taskType 任务类型
 * @param {Object} repositories 线程/服务器资源
 * @returns {Promise<ITaskExecutor>}
 */
export async function createExportBookTask(config, taskType, { repositories }) {
    const { ebookRepository, volumeRepository, chapterRepository, reviewRuleRepository } = repositories;
    const textCleanup = new TextCleanupService(reviewRuleRepository, new MemoryCache());

    const bookServ = new BookQueryService(ebookRepository);
    const chapServ = new ChapterQueryService(chapterRepository, textCleanup);
    const volumeServ = new VolumeQueryService(volumeRepository);

    const fileScanServ = new FileSystemScanner(config.repository?.path);
    const fileServ = new FileSystemWriter(config.repository?.path);
    const tempFolder = await fileServ.accessDir(config.tempDir?.path);
    const factory = new GeneratorFactory(tempFolder);
    const coverService = new CoverService(fileServ, null, config);
    const eventMgr = new EventManager(new EventEmitter());
    const systemConfigService = new SystemConfigService(repositories.systemConfigRepository);


    //注册监听后处理事件
    eventMgr.once(EXPORT_EVENTS.INVENTORY_ARCHIVE, ({ files, delay }) => {   //转存
        setTimeout(async () => {
            for (const ff of files) await fileServ.moveFile(ff.filepath, [config.archive.path, ff.originalFilename]);
        }, delay);
    });
    eventMgr.once(EXPORT_EVENTS.TEMP_CLEANUP, ({ filePath, delay }) => {    //清理文件
        if (filePath) setTimeout(async () => {
            try { await fileServ.deleteFile(filePath, true); } catch (e) { }//兜底的，如果转移了就会出错，直接忽略。
        }, delay || 0);
    });
    new EmailService(new NodemailerEmailSender(), systemConfigService, null, eventMgr);//注册邮件发送事件
    new ExportOrchestrator(eventMgr, config);//注册文件生成完成事件

    const bookExpServ = new BookExportService({
        book: bookServ,
        volume: volumeServ,
        chapter: chapServ,
    }, factory, coverService, fileScanServ, textCleanup, eventMgr, config);
    return new BookExportExecutor(bookExpServ);
}
export default createExportBookTask;