/**
 * @swagger
 * components:
 *   schemas:
 *     ChapterOrderItem:
 *       type: object
 *       description: 章节排序项
 *       properties:
 *         indexId:
 *           type: number
 *           description: 章节 ID（目录项 ID）
 *           example: 49017
 *         newOrder:
 *           type: number
 *           description: 新的排序序号
 *           example: 1
 *       required:
 *         - indexId
 *         - newOrder
 *
 *     ChapterOrderRequest:
 *       type: array
 *       description: 批量更新章节排序的请求体（数组）
 *       items:
 *         $ref: '#/components/schemas/ChapterOrderItem'
 *
 *   examples:
 *     ChapterOrderRequestExample:
 *       summary: 批量更新章节排序请求示例
 *       value:
 *         - indexId: 22
 *           newOrder: 1
 *         - indexId: 23
 *           newOrder: 2
 *         - indexId: 24
 *           newOrder: 3
 */