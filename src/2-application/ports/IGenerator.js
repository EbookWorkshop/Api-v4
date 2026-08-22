import { BookExportData } from "../dtos/BookExportData.dto.js"
/**
 * 电子书生成器接口（端口）
 * 所有具体生成器（Epub、Pdf）必须实现此接口
 */
export class IGenerator {
    /**
     * 生成电子书文件
     * @param {BookExportData} ebook - 统一装配好的数据
     * @param {string} outputPath - 输出文件路径（含后缀）
     * @returns {Promise<{ filePath: string, size: number }>}
     */
    async generate(ebook, outputPath) {
        throw new Error('Method not implemented');
    }
}