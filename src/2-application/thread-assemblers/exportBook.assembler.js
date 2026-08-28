import { EventEmitter } from 'node:events';

import { ITaskExecutor } from "../ports/ITaskExecutor.js";
import { BookExportExecutor } from "../services/executor/BookExportExecutor.js";
import { BookExportService } from "../services/BookExportService.js";
import { BookQueryService } from "../services/BookQueryService.js";
import { VolumeQueryService } from "../services/VolumeQueryService.js"
import { ChapterQueryService } from "../services/ChapterQueryService.js";
import { SystemConfigService } from "../services/SystemConfigService.js";

import { EventManager } from "../../4-infrastructure/event/EventManager.js";
import { FileSystemWriter } from "../../4-infrastructure/server/adapters/FileSystemWriter.js";
import { GeneratorFactory } from '../../4-infrastructure/server/generators/GeneratorFactory.js';

import { EmailService } from '../services/EmailService.js';
import { NodemailerEmailSender } from "../../4-infrastructure/email/NodemailerEmailSender.js"
import { ExportOrchestrator } from "../orchestrators/ExportOrchestrator.js"
/** 
 * 负责组装出导出器
 * @param {Object} config 配置
 * @param {Object} repositories 线程/服务器资源
 * @returns {ITaskExecutor}
 */
export async function createExportBookTask(config, repositories) {
    const { ebookRepository, volumeRepository, chapterRepository } = repositories;
    const bookServ = new BookQueryService(ebookRepository);
    const chapServ = new ChapterQueryService(chapterRepository);
    const volumeServ = new VolumeQueryService(volumeRepository);

    const fileServ = new FileSystemWriter(config.repository?.path);
    const tempFolder = await fileServ.accessDir(config.tempDir?.path);
    const factory = new GeneratorFactory(tempFolder);

    const eventMgr = new EventManager(new EventEmitter());
    const systemConfigService = new SystemConfigService(repositories.systemConfigRepository);

    new EmailService(new NodemailerEmailSender(), systemConfigService, null, eventMgr);
    new ExportOrchestrator(eventMgr, config);

    const bookExpServ = new BookExportService({
        book: bookServ,
        volume: volumeServ,
        chapter: chapServ,
    }, factory, fileServ, eventMgr, config);
    return new BookExportExecutor(bookExpServ);
}
export default createExportBookTask;