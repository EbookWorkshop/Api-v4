/**
 * @swagger
 * components:
 *   schemas:
 *     TagCreateRequest:
 *       type: object
 *       description: 创建标签的请求体
 *       properties:
 *         bookId:
 *           type: integer
 *           description: 关联的图书 ID（可选）
 *           example: 209
 *         tagText:
 *           type: string
 *           description: 标签文本（必填）
 *           example: "推理小说"
 *         color:
 *           type: string
 *           description: 标签颜色（可选，十六进制颜色码）
 *           example: "#1E90FF"
 *       required:
 *         - tagText
 *
 *   examples:
 *     TagCreateRequestExample:
 *       summary: 创建标签的请求体示例（包含可选字段）
 *       value:
 *         bookId: 209
 *         tagText: "推理小说"
 *         color: "#1E90FF"
 *
 *     TagCreateRequestMinimal:
 *       summary: 创建标签的请求体示例（仅必填字段）
 *       value:
 *         tagText: "经典"
 *
 *     CreateTagSuccess:
 *       summary: 标签创建成功响应示例
 *       value:
 *         code: 20000
 *         msg: "success"
 *         timestamp: "2026-08-20T16:00:00.000Z"
 */