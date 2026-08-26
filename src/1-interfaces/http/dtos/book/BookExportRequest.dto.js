import { UserInputError } from "../../../../5-shared/errors/index.js";

export class ExportBookRequest {
    /**
     * @swagger
     * components:
     *   schemas:
     *     ExportBookRequest:
     *       type: object
     *       description: 导出图书的请求体（适用于 epub/pdf/txt 格式）
     *       properties:
     *         bookId:
     *           type: integer
     *           description: 要导出的图书 ID
     *           example: 1
     *         volumeIds:
     *           type: array
     *           description: 要导出的分卷 ID 列表（为空数组表示全部）
     *           items:
     *             type: integer
     *           example: []
     *         chapterIds:
     *           type: array
     *           nullable: true
     *           description: 要导出的章节 ID 列表（为 null 表示全部）
     *           items:
     *             type: integer
     *           example: null
     *         sendByEmail:
     *           type: boolean
     *           description: 是否通过邮件发送导出文件
     *           example: false
     *         isExportToInventory:
     *           type: boolean
     *           description: 是否导出到库存（或本地存储）
     *           example: false
     *         fontFamily:
     *           type: string
     *           description: 导出的字体设置（可为空）、仅Pdf需要
     *           example: ""
     *         embedTitle:
     *           type: boolean
     *           description: 是否在导出书籍中嵌入章节标题
     *           example: true
     *         embedBookName:
     *           type: boolean
     *           description: 是否在导出文件中嵌入书名，当嵌入书名为真时，封面图片需要采用 coverImageData 提供的数据
     *           example: false
     *         enableIndent:
     *           type: boolean
     *           description: 是否启用首行缩进
     *           example: true
     *         coverImageData:
     *           type: string
     *           description: 封面图片数据（base64 格式，可选，Txt无效。不含【data:image/png;base64,】）
     *           example: "iVBORw0KGgoAAAANSUhEUgAAAAEAAAABCAYAAAAfFcSJAAAADUlEQVR42mP8z8BQDwAEhQGAhKmMIQAAAABJRU5ErkJggg=="
     *         isCompact:
     *           type: boolean
     *           description: 是否紧凑排版——删除空行
     *           example: false
     *       required:
     *         - bookId
     *
     *   examples:
     *     ExportBookRequestExample:
     *       summary: 导出请求示例（完整字段）
     *       value:
     *         bookId: 1
     *         volumeIds: []
     *         chapterIds: null
     *         sendByEmail: false
     *         isExportToInventory: false
     *         fontFamily: ""
     *         embedTitle: true
     *         embedBookName: false
     *         enableIndent: true
     *         coverImageData: "iVBORw0KGgoAAAANSUhEUgAAAAEAAAABCAYAAAAfFcSJAAAADUlEQVR42mP8z8BQDwAEhQGAhKmMIQAAAABJRU5ErkJggg=="
     *         isCompact: false
     */
    static fromBody(body) {
        const setting = body;
        if (isNaN(setting.bookId)) throw new UserInputError("bookId 为必须");
        return setting;
    }
}