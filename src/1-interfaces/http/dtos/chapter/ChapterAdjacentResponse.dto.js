/**
 * @swagger
 * components:
 *   schemas:
 *     # 相邻章节信息定义
 *
 *     ChapterAdjacentItem:
 *       type: object
 *       description: 相邻章节 ID 信息（可空）
 *       properties:
 *         id:
 *           type: integer
 *           description: 章节 ID（目录项 ID）
 *           example: 49028
 *       required:
 *         - id
 *
 *     ChapterAdjacent:
 *       type: object
 *       description: 前一篇和后一篇章节 ID
 *       properties:
 *         pre:
 *           description: 上一章节 ID，若无则为 null
 *           allOf:
 *             - $ref: '#/components/schemas/ChapterAdjacentItem'
 *           nullable: true
 *         next:
 *           description: 下一章节 ID，若无则为 null
 *           allOf:
 *             - $ref: '#/components/schemas/ChapterAdjacentItem'
 *           nullable: true
 *       required:
 *         - pre
 *         - next
 *
 *     ChapterAdjacentResponse:
 *       allOf:
 *         - $ref: '#/components/schemas/ApiResponse'
 *         - type: object
 *           properties:
 *             data:
 *               $ref: '#/components/schemas/ChapterAdjacent'
 *       required:
 *         - data
 *
 *   examples:
 *     ChapterAdjacentSuccess:
 *       summary: 相邻章节成功响应示例（前后均有）
 *       value:
 *         code: 20000
 *         msg: "success"
 *         timestamp: "2026-08-15T10:00:00.000Z"
 *         data:
 *           pre:
 *             id: 49028
 *           next:
 *             id: 49030
 *
 *     ChapterAdjacentOnlyNext:
 *       summary: 相邻章节成功响应示例（仅后一篇存在）
 *       value:
 *         code: 20000
 *         msg: "success"
 *         timestamp: "2026-08-15T10:00:00.000Z"
 *         data:
 *           pre: null
 *           next:
 *             id: 49018
 *
 *     ChapterAdjacentOnlyPre:
 *       summary: 相邻章节成功响应示例（仅前一篇存在）
 *       value:
 *         code: 20000
 *         msg: "success"
 *         timestamp: "2026-08-15T10:00:00.000Z"
 *         data:
 *           pre:
 *             id: 49028
 *           next: null
 *
 *     ChapterAdjacentNotFound:
 *       summary: 章节不存在时的错误响应示例
 *       value:
 *         code: 40400
 *         msg: "未找到该章节"
 *         timestamp: "2026-08-15T10:00:00.000Z"
 *         data: null
 */