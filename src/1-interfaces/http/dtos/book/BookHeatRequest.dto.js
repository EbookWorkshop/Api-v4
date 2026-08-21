/**
 * @swagger
 * components:
 *   schemas:
 *     BookHeatRequest:
 *       type: object
 *       description: 更新图书热度的请求体
 *       properties:
 *         bookId:
 *           type: integer
 *           description: 图书 ID
 *           example: 130
 *       required:
 *         - bookId
 * 
 *   examples:
 *     BookHeatRequestExample:
 *       summary: 更新图书热度的请求体示例
 *       value:
 *         bookId: 130
 * 
 */