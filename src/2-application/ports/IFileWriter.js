export class IFileWriter {
    /**
     * 
     * @param {string} repositoryPath 资源库的文件地址
     */
    constructor(repositoryPath) {
    }

    /**
     * 写入文件—— NOTE:  以仓库为基础路径
     * @param {string|Array<string>} filePath 存储路径，若为数组则是路径目录
     * @param {*} data 写入数据
     * @param {*} format 写入格式，如 base64
     * @returns {string} 实际存储的相对路径——相对仓库
     */
    async saveFile(path, data, format = "") { throw new Error('接口方法尚未实现'); }

    /**
     * 转换为PNG格式
     * @param {string} filePath 
     * @returns {string} newFilePath
     */
    async converToPNG(filePath) { throw new Error('接口方法尚未实现'); }

    /**
     * 获取服务器地址
     * @param {Array<string>|string} dir 路径
     * @returns 
     */
    mapPath(dir) { throw new Error('接口方法尚未实现'); }

}