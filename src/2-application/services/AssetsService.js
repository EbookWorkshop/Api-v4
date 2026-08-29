import path from "node:path";
import { IFileScanner } from '../ports/IFileScanner.js';
import { AppError } from "../../5-shared/errors/index.js"

export class AssetsService {
    /** @type {IFileScanner} */
    #fileScanner;
    #fileWriter;
    #archiveDir;
    #config;

    /**
     * @param {IFileScanner} fileScanner 
     */
    constructor(fileScanner, fileWriter, config) {
        this.#fileScanner = fileScanner;
        this.#fileWriter = fileWriter;
        this.#config = config;

        this.#archiveDir = config.archive.path;
    }

    async listArchiveBooks() {
        return await this.#fileScanner.listFiles(this.#config?.archive?.path, { detail: true }) || [];
    }

    /**
     * 删除库存文件
     * @param {string} fileName 
     * @returns 
     */
    async deleteFile(fileName) {
        const fullPath = path.join(this.#archiveDir, fileName);
        // 检查是否存在
        if (! await this.#fileScanner.accessFile(fullPath)) throw new AppError(`归档文件 ${fileName} 不存在`, 404);
        // 删除文件
        await this.#fileWriter.deleteFile(fullPath);
        return true;
    }
}