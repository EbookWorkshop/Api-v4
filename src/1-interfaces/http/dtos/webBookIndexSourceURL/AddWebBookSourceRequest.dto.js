/**
 * @swagger
 * components:
 *   schemas:
 *     AddWebBookSourceRequest:
 *       type: object
 *       description: 为网页图书添加新源的请求体
 *       properties:
 *         bookId:
 *           type: integer
 *           description: 网页图书 ID
 *           example: 202
 *         url:
 *           type: string
 *           description: 新源 URL 地址
 *           example: "https://www.example.com/new-source"
 *       required:
 *         - bookId
 *         - url
 *
 *   examples:
 *     AddWebBookSourceRequestExample:
 *       summary: 添加新源请求示例
 *       value:
 *         bookId: 202
 *         url: "https://www.example.com/new-source"
 */