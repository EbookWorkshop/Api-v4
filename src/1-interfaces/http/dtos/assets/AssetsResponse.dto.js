/**
 * @swagger
 * components:
 *   schemas:
 *     ArchiveBookFile:
 *       type: object
 *       description: 归档图书文件信息
 *       properties:
 *         file:
 *           type: string
 *           description: 文件名（含扩展名）
 *           example: "毛主席语录.epub"
 *         name:
 *           type: string
 *           description: 图书名称（不含扩展名）
 *           example: "毛主席语录"
 *         ext:
 *           type: string
 *           description: 文件扩展名
 *           example: "epub"
 *         size:
 *           type: integer
 *           description: 文件大小（字节）
 *           example: 118508
 *         createTime:
 *           type: string
 *           description: 创建时间（格式：YYYY/M/D HH:mm:ss）
 *           example: "2026/6/11 17:44:43"
 *         filePath:
 *           type: string
 *           description: 文件存储相对路径
 *           example: "Books/毛主席语录.epub"
 *       required:
 *         - file
 *         - name
 *         - ext
 *         - size
 *         - createTime
 *         - filePath
 *
 *     ArchiveBookListResponse:
 *       allOf:
 *         - $ref: '#/components/schemas/ApiResponse'
 *         - type: object
 *           properties:
 *             data:
 *               type: array
 *               items:
 *                 $ref: '#/components/schemas/ArchiveBookFile'
 *       required:
 *         - data
 *
 *   examples:
 *     ArchiveBookListSuccess:
 *       summary: 归档图书文件列表成功响应示例
 *       value:
 *         code: 20000
 *         msg: "success"
 *         timestamp: "2026-08-20T14:00:00.000Z"
 *         data:
 *           - file: "毛主席语录.epub"
 *             name: "毛主席语录"
 *             ext: "epub"
 *             size: 118508
 *             createTime: "2026/6/11 17:44:43"
 *             filePath: "Books/毛主席语录.epub"
 *           - file: "福尔摩斯探案集.mobi"
 *             name: "福尔摩斯探案集"
 *             ext: "mobi"
 *             size: 245678
 *             createTime: "2026/7/22 09:12:05"
 *             filePath: "Books/福尔摩斯探案集.mobi"
 *
 *     ArchiveBookListEmpty:
 *       summary: 归档图书文件列表为空时的响应示例
 *       value:
 *         code: 20000
 *         msg: "success"
 *         timestamp: "2026-08-20T14:00:00.000Z"
 *         data: []
 */

/**
 * @swagger
 * components:
 *   parameters:
 *     ArchiveNameParam:
 *       in: path
 *       name: name
 *       schema:
 *         type: string
 *       required: true
 *       description: 要删除的归档文件名（如 "ewrdf.txt"）
 *       example: "ewrdf.txt"
 */