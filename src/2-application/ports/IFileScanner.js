// src/2-application/ports/IFileScanner.js
export class IFileScanner {
    /**
     * 
     * @param {string} repositoryPath 资源库的文件地址
     */
    constructor(repositoryPath) {
    }

    /**
     * 
     * @param {*} dirPath 相对资源目录的相对路径
     * @param {*} basename 文件名
     */
    async findFileByBasename(dirPath, basename) {
        throw new Error('接口方法尚未实现');
    }

    /**
     * 按后缀类型，列出指定目录下符合要求的文件
     * @param {*} sourcePath 相对资源目录的相对路径
     * @param {number[]} [option.filetype] - 仅需要的文件后缀，用于限定获取指定类型文件的列表
     * @param {boolean} [option.detail] - 是否返回明细信息（如大小，创建日期等）
     * @returns 
     */
    async listFiles(sourcePath, options = {}) {
        throw new Error('接口方法尚未实现');
    }

    /**
     * 检查文件是否存在
     * @param {*} filePath 文件路径
     * @returns {boolean} 文件是否存在
     */
    async accessFile(filePath) {
        throw new Error('接口方法尚未实现');
    }

    /**
     * 获取服务器地址
     * @param {Array<string>|string} dir 路径
     * @returns 
     */
    mapPath(dir) { throw new Error('接口方法尚未实现'); }
}