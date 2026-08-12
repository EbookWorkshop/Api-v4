/**
 * @swagger
 * components:
 *   parameters:
 *     TagIdQuery:
 *       in: query
 *       name: tagid
 *       schema:
 *         type: integer
 *         minimum: 1
 *       required: false
 *       description: 包含指定标签 ID 的图书，负数或非数字将忽略（例如 23）
 *       example: 23
 *     NotTagQuery:
 *       in: query
 *       name: nottag
 *       schema:
 *         type: string
 *         pattern: '^\d+(,\d+)*$'
 *       required: false
 *       description: 排除指定标签 ID 的图书，多个 ID 用逗号分隔（例如 43,34）
 *       example: "43,34"
 */