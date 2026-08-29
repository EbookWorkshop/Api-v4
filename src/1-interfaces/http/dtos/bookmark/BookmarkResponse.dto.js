/**
 * @swagger
 * components:
 *   schemas:
 *     BookmarkItem:
 *       type: object
 *       description: 书签信息
 *       properties:
 *         id:
 *           type: integer
 *           description: 书签唯一ID
 *           example: 1
 *         chapterId:
 *           type: integer
 *           description: 章节ID
 *           example: 3403
 *         chapterTitle:
 *           type: string
 *           description: 章节标题
 *           example: "一、演绎法的研究"
 *         bookId:
 *           type: integer
 *           description: 所属图书ID
 *           example: 209
 *         bookName:
 *           type: string
 *           description: 图书名称
 *           example: "福尔摩斯探案全集"
 *         createdAt:
 *           type: string
 *           format: date-time
 *           description: 创建时间
 *           example: "2026-08-29T10:00:00.000Z"
 *       required:
 *         - id
 *         - chapterId
 *         - chapterTitle
 *         - bookId
 *         - bookName
 *         - createdAt
 * 
 *     BookmarkListResponse:
 *       allOf:
 *         - $ref: '#/components/schemas/ApiResponse'
 *         - type: object
 *           properties:
 *             data:
 *               type: array
 *               items:
 *                 $ref: '#/components/schemas/BookmarkItem'
 * 
 *   examples:
 *     BookmarkListSuccess:
 *       summary: 书签列表成功响应示例
 *       value:
 *         code: 20000
 *         msg: "success"
 *         timestamp: "2026-08-29T10:00:00.000Z"
 *         data:
 *           - id: 1
 *             chapterId: 3403
 *             chapterTitle: "一、演绎法的研究"
 *             bookId: 209
 *             bookName: "福尔摩斯探案全集"
 *             createdAt: "2026-08-29T10:00:00.000Z"
 *           - id: 2
 *             chapterId: 3404
 *             chapterTitle: "二、犯罪现场"
 *             bookId: 209
 *             bookName: "福尔摩斯探案全集"
 *             createdAt: "2026-08-29T10:30:00.000Z"
 * 
 *     BookmarkListEmpty:
 *       summary: 书签列表为空时的响应示例
 *       value:
 *         code: 20000
 *         msg: "success"
 *         timestamp: "2026-08-29T10:00:00.000Z"
 *         data: []
 * 
 *     BookmarkAddSuccess:
 *       summary: 添加书签成功响应示例
 *       value:
 *         code: 20000
 *         msg: "success"
 *         timestamp: "2026-08-29T10:00:00.000Z"
 *         data: true
 * 
 *     BookmarkDeleteSuccess:
 *       summary: 删除书签成功响应示例
 *       value:
 *         code: 20000
 *         msg: "success"
 *         timestamp: "2026-08-29T10:00:00.000Z"
 *         data: 1   # 影响行数
 */