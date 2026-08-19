/**
 * @swagger
 * components:
 *   schemas:
 *     BookSearchResultItem:
 *       type: object
 *       description: 章节搜索结果条目
 *       properties:
 *         id:
 *           type: integer
 *           description: 章节 ID（目录项 ID）
 *           example: 49017
 *         Title:
 *           type: string
 *           description: 章节标题
 *           example: "一、演绎法的研究"
 *         BookId:
 *           type: integer
 *           description: 所属图书 ID
 *           example: 211
 *         Content:
 *           type: string
 *           description: 章节内容（可能包含部分匹配片段）
 *           example: "福尔摩斯正在研究..."
 *         HitCount:
 *           type: integer
 *           description: 关键词在章节中的命中次数
 *           example: 19
 *         BookName:
 *           type: string
 *           description: 所属图书名称
 *           example: "福尔摩斯探案全集"
 *         VolumeTitle:
 *           type: string
 *           description: 所属分卷标题
 *           example: "血字的研究"
 *       required:
 *         - id
 *         - Title
 *         - BookId
 *         - HitCount
 *         - BookName
 *         - VolumeTitle
 *
 *     BookSearchResponse:
 *       allOf:
 *         - $ref: '#/components/schemas/ApiResponse'
 *         - type: object
 *           properties:
 *             data:
 *               type: array
 *               items:
 *                 $ref: '#/components/schemas/BookSearchResultItem'
 *       required:
 *         - data
 *
 *   examples:
 *     BookSearchSuccess:
 *       summary: 搜索成功响应示例
 *       value:
 *         code: 20000
 *         msg: "success"
 *         timestamp: "2026-08-19T15:00:00.000Z"
 *         data:
 *           - id: 49017
 *             Title: "一、演绎法的研究"
 *             BookId: 211
 *             Content: "福尔摩斯正在研究..."
 *             HitCount: 19
 *             BookName: "福尔摩斯探案全集"
 *             VolumeTitle: "血字的研究"
 *           - id: 49018
 *             Title: "二、犯罪现场"
 *             BookId: 211
 *             Content: "福尔摩斯抵达现场..."
 *             HitCount: 8
 *             BookName: "福尔摩斯探案全集"
 *             VolumeTitle: "血字的研究"
 *
 *     BookSearchEmpty:
 *       summary: 搜索无结果响应示例
 *       value:
 *         code: 20000
 *         msg: "success"
 *         timestamp: "2026-08-19T15:00:00.000Z"
 *         data: []
 */