import { ITaskExecutor } from "../../../2-application/ports/ITaskExecutor.js";
import { BookExportExecutor } from "../../../2-application/services/executor/BookExportExecutor.js";
import { BookExportService } from "../../../2-application/services/BookExportService.js";
import { BookQueryService } from "../../../2-application/services/BookQueryService.js";
import { VolumeQueryService } from "../../../2-application/services/VolumeQueryService.js"
import { ChapterQueryService } from "../../../2-application/services/ChapterQueryService.js";
import { GeneratorFactory } from '../../../4-infrastructure/server/generators/GeneratorFactory.js';
import { FileSystemWriter } from "../../../4-infrastructure/server/adapters/FileSystemWriter.js"

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


    const bookExpServ = new BookExportService({
        book: bookServ,
        volume: volumeServ,
        chapter: chapServ,
    }, factory, fileServ, config);

    return new BookExportExecutor(bookExpServ);
}
export default createExportBookTask;