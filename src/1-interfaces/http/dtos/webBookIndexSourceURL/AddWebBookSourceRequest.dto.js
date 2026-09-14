/**
 * @swagger
 * components:
 *   schemas:
 *     AddWebBookSourceRequest:
 *       type: object
 *       description: 新增网页图书源的请求体
 *       properties:
 *         bookId:
 *           type: integer
 *           description: 网页图书 ID
 *           example: 202
 *         defSource:
 *           type: boolean
 *           description: 是否为默认源
 *           example: true
 *         url:
 *           type: string
 *           description: 源 URL 地址
 *           example: "https://www.example.com/source"
 *         type:
 *           type: string
 *           enum: ["index", "info"]
 *           description: 源类型（index 表示目录页，info 表示信息页）
 *           example: "index"
 *       required:
 *         - bookId
 *         - url
 *         - type
 *
 *   examples:
 *     AddWebBookSourceRequestExample:
 *       summary: 新增网页图书源请求示例
 *       value:
 *         bookId: 202
 *         defSource: true
 *         url: "https://www.example.com/source"
 *         type: "index"
 */