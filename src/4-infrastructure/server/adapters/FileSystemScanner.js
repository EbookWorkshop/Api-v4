import path from "node:path";
import { findFileByBasename as impl, listFiles as myListFiles, accessFile, mapPath } from '../drivers/fileSystemDriver.js';
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
        const fileList = await myListFiles(realPath, options);
        if (!options.detail) return fileList;
        return fileList.map(file => {
            const fileDir = path.relative(this.#repositoryPath, file.path);       //将服务器绝对路径改为相对资源库的相对路径
            file.filePath = path.join(fileDir, file.file);
            file.path = fileDir;
            return file;
        });
    }

    /**
     * 文件是否存在——相对仓库路径
     * @param {*} filePath 
     * @returns 
     */
    async accessFile(filePath) {
        return accessFile(this.mapPath(filePath));
    }

    /**
     * 获取服务器地址——相对仓库的路径
     * @param {Array<string>|string} dir 
     * @returns 
     */
    mapPath(dir) {
        return mapPath(dir, this.#repositoryPath);
    }
}