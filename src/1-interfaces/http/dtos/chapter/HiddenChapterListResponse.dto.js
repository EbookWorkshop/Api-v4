/**
 * @swagger
 * components:
 *   schemas:
 *     HiddenChapterItem:
 *       type: object
 *       description: 隐藏章节摘要信息
 *       properties:
 *         Title:
 *           type: string
 *           description: 章节标题
 *           example: "简介"
 *         IndexId:
 *           type: integer
 *           description: 章节 ID（目录项 ID）
 *           example: 49016
 *       required:
 *         - Title
 *         - IndexId
 *
 *     HiddenChapterListResponse:
 *       allOf:
 *         - $ref: '#/components/schemas/ApiResponse'
 *         - type: object
 *           properties:
 *             data:
 *               type: array
 *               items:
 *                 $ref: '#/components/schemas/HiddenChapterItem'
 *       required:
 *         - data
 *
 *   examples:
 *     HiddenChapterListSuccess:
 *       summary: 隐藏章节列表成功响应示例
 *       value:
 *         code: 20000
 *         msg: "success"
 *         timestamp: "2026-08-21T16:00:00.000Z"
 *         data:
 *           - Title: "简介"
 *             IndexId: 49016
 *           - Title: "作者的话"
 *             IndexId: 49017
 *
 *     HiddenChapterListEmpty:
 *       summary: 无隐藏章节时的响应示例
 *       value:
 *         code: 20000
 *         msg: "success"
 *         timestamp: "2026-08-21T16:00:00.000Z"
 *         data: []
 */