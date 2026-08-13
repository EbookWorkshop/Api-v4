/**
 * @swagger
 * components:
 *   schemas:
 *     TagItem:
 *       type: object
 *       properties:
 *         id:
 *           type: integer
 *           description: 标签唯一 ID
 *           example: 5
 *         Text:
 *           type: string
 *           description: 标签显示名称
 *           example: "完结"
 *         Color:
 *           type: string
 *           description: 标签颜色（十六进制颜色码）
 *           example: "#D91AD9"
 *         Count:
 *           type: integer
 *           description: 该标签下图书数量
 *           example: 71
 *       required:
 *         - id
 *         - Text
 *         - Color
 *         - Count
 *
 *     TagListResponse:
 *       allOf:
 *         - $ref: '#/components/schemas/ApiResponse'
 *         - type: object
 *           properties:
 *             data:
 *               type: array
 *               items:
 *                 $ref: '#/components/schemas/TagItem'
 *               description: 标签列表数据
 *       required:
 *         - data
 *
 *   parameters:
 *     HasBookQuery:
 *       in: query
 *       name: hasbook
 *       schema:
 *         type: integer
 *         enum: [0, 1]
 *         default: 0
 *         description: |
 *           是否只返回有图书的标签：
 *           - `0` 或 `undefined`：返回所有标签
 *           - `1`：仅返回关联了至少一本图书的标签
 *       required: false
 *       example: 1
 *
 *   examples:
 *     TagListSuccess:
 *       summary: 标签列表成功响应示例（有数据）
 *       value:
 *         code: 20000
 *         msg: "success"
 *         timestamp: "2026-08-13T12:00:00.000Z"
 *         data:
 *           - id: 5
 *             Text: "完结"
 *             Color: "#D91AD9"
 *             Count: 71
 *           - id: 12
 *             Text: "科幻"
 *             Color: "#1E90FF"
 *             Count: 34
 *
 *     TagListEmpty:
 *       summary: 标签列表成功响应示例（无数据）
 *       value:
 *         code: 20000
 *         msg: "success"
 *         timestamp: "2026-08-13T12:00:00.000Z"
 *         data: []
 */