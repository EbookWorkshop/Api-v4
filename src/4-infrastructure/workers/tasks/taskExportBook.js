import { EventEmitter } from 'node:events';
import { EventManager } from "../../event/EventManager.js";
import { FileSystemWriter } from "../../server/adapters/FileSystemWriter.js";
import { GeneratorFactory } from '../../server/generators/GeneratorFactory.js';
import { ITaskExecutor } from "../../../2-application/ports/ITaskExecutor.js";

import { EMT_EXPORT_BOOK_END } from "../../../3-domain/constants/Event.js"

import { BookExportExecutor } from "../../../2-application/services/executor/BookExportExecutor.js";
import { BookExportService } from "../../../2-application/services/BookExportService.js";
import { BookQueryService } from "../../../2-application/services/BookQueryService.js";
import { VolumeQueryService } from "../../../2-application/services/VolumeQueryService.js"
import { ChapterQueryService } from "../../../2-application/services/ChapterQueryService.js";

/** 
 * 负责组装出导出器
 * @param {Object} repositories 
 * @returns {ITaskExecutor}
 */
export async function createExportBookTask(repositories, config) {
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