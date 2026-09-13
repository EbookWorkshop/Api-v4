// import { AppError, UserInputError } from "../../5-shared/errors/index.js"

export class ImportService {
    #archivePath;
    #fileWriterService;

    constructor(fileWriterService, archivePath) {
        this.#fileWriterService = fileWriterService;
        this.#archivePath = archivePath;
    }

    /**
     * 加入库存
     * @param {import("koa-body").ScalarOrArrayFiles} file 
     * @returns 
     */
    async add(file) {
        return await this.#fileWriterService.moveFile(file.filepath, [this.#archivePath, file.originalFilename]);
    }
}
