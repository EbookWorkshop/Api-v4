/**
 * @swagger
 * components:
 *   schemas:
 *     WebBookSourceItem:
 *       type: object
 *       description: 网页图书源信息
 *       properties:
 *         id:
 *           type: integer
 *           description: 源记录 ID
 *           example: 207
 *         Path:
 *           type: string
 *           description: 源 URL 地址
 *           example: "https://www.ex.com/pa/1"
 *         WebBookId:
 *           type: integer
 *           description: 关联的网页图书 ID
 *           example: 202
 *         Type:
 *           type: string
 *           nullable: true
 *           description: 源类型（可能为 null）
 *           example: null
 *       required:
 *         - id
 *         - Path
 *         - WebBookId
 *
 *     WebBookSourceListResponse:
 *       allOf:
 *         - $ref: '#/components/schemas/ApiResponse'
 *         - type: object
 *           properties:
 *             data:
 *               type: array
 *               items:
 *                 $ref: '#/components/schemas/WebBookSourceItem'
 *       required:
 *         - data
 *
 *   examples:
 *     WebBookSourceListSuccess:
 *       summary: 网页图书源列表成功响应示例
 *       value:
 *         code: 20000
 *         msg: "success"
 *         timestamp: "2026-08-31T10:00:00.000Z"
 *         data:
 *           - id: 207
 *             Path: "https://www.ex.com/pa/1"
 *             WebBookId: 202
 *             Type: null
 *           - id: 208
 *             Path: "https://www.ex.com/pa/2"
 *             WebBookId: 202
 *             Type: "alternative"
 */