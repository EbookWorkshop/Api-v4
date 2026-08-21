/**
 * @swagger
 * components:
 *   schemas:
 *     ChapterDetail:
 *       type: object
 *       description: 章节详情（包含关联的图书信息）
 *       properties:
 *         Title:
 *           type: string
 *           description: 章节标题
 *           example: "一、演绎法的研究"
 *         Content:
 *           type: string
 *           nullable: true
 *           description: 章节正文内容（可能为 null）
 *           example: null
 *         IndexId:
 *           type: integer
 *           description: 目录项唯一 ID
 *           example: 3403
 *         OrderNum:
 *           type: integer
 *           description: 排序序号
 *           example: 557
 *         VolumeId:
 *           type: integer
 *           nullable: true
 *           description: 所属分卷 ID（可能为 null）
 *           example: null
 *         Book:
 *           $ref: '#/components/schemas/BookBase'
 *           description: 所属图书信息（包含 id 及基础字段）
 *       required:
 *         - Title
 *         - IndexId
 *         - OrderNum
 *         - Book
 *
 *     ChapterDetailResponse:
 *       allOf:
 *         - $ref: '#/components/schemas/ApiResponse'
 *         - type: object
 *           properties:
 *             data:
 *               $ref: '#/components/schemas/ChapterDetail'
 *       required:
 *         - data
 *
 *   parameters:
 *     ChapterIdQuery:
 *       in: query
 *       name: chapterid
 *       schema:
 *         type: integer
 *         minimum: 1
 *       required: true
 *       description: 章节 ID（目录项 ID），必须为正整数
 *       example: 53403
 *
 *   examples:
 *     ChapterDetailSuccess:
 *       summary: 章节详情成功响应示例
 *       value:
 *         code: 20000
 *         msg: "success"
 *         timestamp: "2026-08-15T10:00:00.000Z"
 *         data:
 *           Title: "一、演绎法的研究"
 *           Content: null
 *           IndexId: 3403
 *           OrderNum: 557
 *           VolumeId: null
 *           Book:
 *             id: 208
 *             BookName: "福尔摩斯探案全集"
 *             Author: "阿瑟·柯南·道尔"
 *             CoverImg: null
 *             Hotness: 184
 *             TotalWord: 0
 *             createdAt: "2026-05-21T06:02:14.832Z"
 *             updatedAt: "2026-08-05T14:09:11.695Z"
 *
 *     ChapterDetailNotFound:
 *       summary: 章节不存在时的错误响应示例
 *       value:
 *         code: 40400
 *         msg: "未找到该章节"
 *         timestamp: "2026-08-15T10:00:00.000Z"
 *         data: null
 */

/**
 * @swagger
 * components:
 *   schemas:
 *     ChapterIdRequest:
 *       type: object
 *       description: 将章节设为引言的请求体
 *       properties:
 *         chapterId:
 *           type: integer
 *           description: 章节 ID（目录项 ID）
 *           example: 49017
 *       required:
 *         - chapterId
 *
 *   examples:
 *     ChapterIdRequestExample:
 *       summary: 将章节设为引言的请求示例
 *       value:
 *         chapterId: 49017
 */