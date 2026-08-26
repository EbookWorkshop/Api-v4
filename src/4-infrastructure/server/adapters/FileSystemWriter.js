import path from "node:path";
import sharp from "sharp";     //提供图像格式转换
import { saveFile, accessDir } from '../drivers/fileSystemDriver.js';
import { IFileWriter } from '../../../2-application/ports/IFileWriter.js';

export class FileSystemWriter extends IFileWriter {
    #repositoryPath;
    constructor(repositoryPath) { super(repositoryPath); this.#repositoryPath = repositoryPath; }

    /**
     * 写入文件——以仓库为基础路径
     * @param {string|Array<string>} filePath 存储路径，若为数组则是路径目录
     * @param {*} data 写入数据
     * @param {*} format 写入格式，如 base64
     * @returns {string} 实际存储路径
     */
    async saveFile(filePath, data, format = "") {
        let pathArray = [process.cwd(), this.#repositoryPath];
        if (typeof (filePath) === "string") pathArray.push(filePath);
        else if (Array.isArray(filePath)) pathArray.push(...filePath);
        const tempFile = path.join(...pathArray);
        await saveFile(tempFile, data, format);
        return tempFile;
    }

    /**
     * 转换为PNG格式
     * @param {string} filePath 
     * @returns {string} newFilePath
     */
    async converToPNG(filePath, tempDir) {
        try {
            const finfo = path.parse(filePath);
            const tempFile = path.join(tempDir, finfo.name + ".png");
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
        const dirArray = [this.#repositoryPath];
        if (Array.isArray(dir)) dirArray.push(...dir);
        else dirArray.push(dir);
        const relativePath = path.join(...dirArray);
        return path.resolve(relativePath);
    }
}