import { BookExportData } from "../dto/BookExportData.dto.js"
/**
 * 电子书生成器接口（端口）
 * 所有具体生成器（Epub、Pdf）必须实现此接口
 */
export class IGenerator {
    /** @type {string} 临时输出目录 */
    tempFolder;
    /**
     * 临时输出目录
     * @param {string} tempFolder 
     */
    constructor(tempFolder) {
        this.tempFolder = tempFolder;
    }
    /**
     * 生成电子书文件
     * @param {BookExportData} ebook - 统一装配好的数据
     * @param {string} outputPath - 输出文件路径（含后缀）
     * @returns {Promise<{ filePath: string, size: number }>}
     * @returns {{ path, filename }} 导出结果
     */
    async generate(ebook, outputPath = "") {
        throw new Error('接口尚未实现！');
    }
}