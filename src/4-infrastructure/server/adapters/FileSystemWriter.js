import path from "node:path";
import sharp from "sharp";     //提供图像格式转换
import { saveFile, saveArrayToFile, accessDir, mapPath, deleteFile, renameFile } from '../drivers/fileSystemDriver.js';
import { IFileWriter } from '../../../2-application/ports/IFileWriter.js';

export class FileSystemWriter extends IFileWriter {
    #repositoryPath;
    constructor(repositoryPath) { super(repositoryPath); this.#repositoryPath = repositoryPath; }

    /**
     * 写入文件——以仓库为基础路径
     * @param {string|Array<string>} filePath 存储路径，若为数组则是路径目录
     * @param {*} data 写入数据，当为字符数组时，将会自动调整背压
     * @param {ObjectEncodingOptions} setting 传入接口的选项，如  { encoding: 'utf8' }
     * @param {string} setting.format 传入数据格式，如 base64
     * @returns {string} 实际存储的相对路径——相对仓库
     */
    async saveFile(filePath, data, option) {
        let pathArray = [this.#repositoryPath];
        if (typeof (filePath) === "string") pathArray.push(filePath);
        else if (Array.isArray(filePath)) pathArray.push(...filePath);
        const tempFile = path.join(...pathArray);

        if (Array.isArray(data)) await saveArrayToFile(tempFile, data, option);
        else await saveFile(tempFile, data, option);

        return path.relative(this.#repositoryPath, tempFile);
    }

    /**
     * 转换为PNG格式
     * @param {string} filePath 
     * @returns {string} newFilePath
     */
    async converToPNG(filePath, tempDir) {
        try {
            const finfo = path.parse(filePath);
            const tempFile = path.join(this.#repositoryPath, tempDir, finfo.name + ".png");
            await sharp(filePath).png().toFile(tempFile);
            return tempFile;
        } catch (error) {
            return null;//文件转换失败
        }
    }

    /**
     * 确保路径存在——相对仓库的路径
     * @param {*} dir 
     * @returns 
     */
    async accessDir(dir) {
        return accessDir(path.join(this.#repositoryPath, dir));
    }

    /**
     * 获取服务器地址——相对仓库的路径
     * @param {Array<string>|string} dir 
     * @returns 
     */
    mapPath(dir) {
        return mapPath(dir, this.#repositoryPath);
    }

    async deleteFile(filePath) {
        return deleteFile(filePath, this.#repositoryPath);
    }

    async renameFile(oldPath, newPath) {
        return renameFile(oldPath, newPath, this.#repositoryPath)
    }
    /**
     * 移动文件——地址基于仓库为基础
     * @param {string|string[]} oldPath 源地址
     * @param {string|string[]} newPath 新地址
     */
    async moveFile(oldPath, newPath) {
        if (Array.isArray(oldPath)) oldPath = path.join(...oldPath);
        if (Array.isArray(newPath)) newPath = path.join(...newPath);
        return renameFile(oldPath, newPath, this.#repositoryPath)
    }

}