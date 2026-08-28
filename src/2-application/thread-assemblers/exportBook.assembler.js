import { EventEmitter } from 'node:events';

import { EMT_EXPORT_BOOK_END } from "../../3-domain/constants/Event.js"

import { ITaskExecutor } from "../ports/ITaskExecutor.js";
import { BookExportExecutor } from "../services/executor/BookExportExecutor.js";
import { BookExportService } from "../services/BookExportService.js";
import { BookQueryService } from "../services/BookQueryService.js";
import { VolumeQueryService } from "../services/VolumeQueryService.js"
import { ChapterQueryService } from "../services/ChapterQueryService.js";

import { EventManager } from "../../4-infrastructure/event/EventManager.js";
import { FileSystemWriter } from "../../4-infrastructure/server/adapters/FileSystemWriter.js";
import { GeneratorFactory } from '../../4-infrastructure/server/generators/GeneratorFactory.js';


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
    eventMgr.on(EMT_EXPORT_BOOK_END, (event) => {
        console.log("收到消息：", EMT_EXPORT_BOOK_END, event);
    })

    const bookExpServ = new BookExportService({
        book: bookServ,
        volume: volumeServ,
        chapter: chapServ,
    }, factory, fileServ, eventMgr, config);
    return new BookExportExecutor(bookExpServ);
}
export default createExportBookTask;