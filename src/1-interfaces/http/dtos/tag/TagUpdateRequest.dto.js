/**
 * @swagger
 * components:
 *   schemas:
 *     UpdateTagRequest:
 *       type: object
 *       description: 更新标签的请求体
 *       properties:
 *         tagId:
 *           type: integer
 *           format: int32
 *           description: 要更新的标签 ID（必填）
 *           example: 1
 *         tagText:
 *           type: string
 *           description: 新的标签文本（可选）
 *           example: "推理小说"
 *         color:
 *           type: string
 *           description: 新的标签颜色（可选，十六进制颜色码）
 *           example: "#FF6B6B"
 *       required:
 *         - tagId
 *
 *   examples:
 *     UpdateTagRequestExample:
 *       summary: 更新标签的请求体示例（完整字段）
 *       value:
 *         tagId: 1
 *         tagText: "推理小说"
 *         color: "#FF6B6B"
 *
 *     UpdateTagRequestPartial:
 *       summary: 更新标签的请求体示例（仅更新部分字段）
 *       value:
 *         tagId: 1
 *         tagText: "悬疑"
 *
 *     UpdateTagSuccess:
 *       summary: 标签更新成功响应示例
 *       value:
 *         code: 20000
 *         msg: "success"
 *         timestamp: "2026-08-20T18:00:00.000Z"
 */