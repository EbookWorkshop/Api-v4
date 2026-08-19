import path from "node:path";
import { findFileByBasename as impl, listFiles as myListFiles } from '../drivers/fileSystemDriver.js';
import { IFileScanner } from '../../../2-application/ports/IFileScanner.js';

export class FileSystemScanner extends IFileScanner {
    #repositoryPath;
    constructor(repositoryPath) { super(repositoryPath); this.#repositoryPath = repositoryPath; }


    async findFileByBasename(dirPath, basename) {
        const realPath = path.join(this.#repositoryPath, dirPath);
        return impl(realPath, basename);
    }

    async listFiles(dirPath, options = {}) {
        const realPath = path.join(this.#repositoryPath, dirPath);
        return (await myListFiles(realPath, options)).map(file => {
            const fileDir = path.relative(this.#repositoryPath, file.path);       //将服务器绝对路径改为相对资源库的相对路径
            file.filePath = path.join(fileDir, file.file);
            file.path = fileDir;
            return file;
        });
    }
}