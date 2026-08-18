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
 *     BookHeatSuccess:
 *       summary: 更新图书热度成功响应（仅状态，无数据）
 *       value:
 *         code: 20000
 *         msg: "success"
 *         data: true
 *         timestamp: "2026-08-19T12:00:00.000Z"
 */