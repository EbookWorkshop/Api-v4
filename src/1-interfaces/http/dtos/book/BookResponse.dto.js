/**
 * @swagger
 * components:
 *   schemas:
 *     BookIndexItem:
 *       type: object
 *       description: 图书目录项
 *       properties:
 *         Title:
 *           type: string
 *           description: 章节标题
 *           example: "一、演绎法的研究"
 *         OrderNum:
 *           type: integer
 *           description: 排序序号
 *           example: 1
 *         VolumeId:
 *           type: integer
 *           description: 所属分卷 ID
 *           example: 53
 *         BookId:
 *           type: integer
 *           description: 所属图书 ID
 *           example: 209
 *         IsHasContent:
 *           type: integer
 *           enum: [0, 1]
 *           description: 是否有内容（1 有，0 无）
 *           example: 1
 *         IndexId:
 *           type: integer
 *           description: 目录项唯一 ID
 *           example: 49017
 *       required:
 *         - Title
 *         - OrderNum
 *         - VolumeId
 *         - BookId
 *         - IsHasContent
 *         - IndexId
 *
 *     BookDetail:
 *       type: object
 *       description: 图书详情（含目录和分卷）
 *       allOf:
 *         - $ref: '#/components/schemas/BookListItem'  # 复用基础字段（id, BookName, Author, CoverImg, Hotness, TotalWord, createdAt, updatedAt）
 *         - type: object
 *           properties:
 *             Index:
 *               type: array
 *               items:
 *                 $ref: '#/components/schemas/BookIndexItem'
 *               description: 图书目录列表
 *             Volumes:
 *               type: array
 *               items:
 *                 $ref: '#/components/schemas/BookVolumeItem'
 *               description: 图书分卷列表
 *             Introduction:
 *               type: string
 *               description: 图书简介
 *               example: "阿瑟·柯南·道尔一共写了四部中篇、五十六部短篇福尔摩斯系列小说..."
 *           required:
 *             - Index
 *             - Volumes
 *             - Introduction
 *
 *     BookDetailResponse:
 *       allOf:
 *         - $ref: '#/components/schemas/ApiResponse'
 *         - type: object
 *           properties:
 *             data:
 *               $ref: '#/components/schemas/BookDetail'
 *       required:
 *         - data
 *
 *   examples:
 *     BookDetailSuccess:
 *       summary: 图书详情成功响应示例
 *       value:
 *         code: 20000
 *         msg: "success"
 *         timestamp: "2026-08-14T10:00:00.000Z"
 *         data:
 *           id: 209
 *           BookName: "福尔摩斯探案全集"
 *           Author: "阿瑟·柯南·道尔"
 *           CoverImg: "#f2e3a4"
 *           Hotness: 192
 *           TotalWord: 1062585
 *           createdAt: "2026-01-13T03:43:40.705Z"
 *           updatedAt: "2026-08-07T08:12:04.748Z"
 *           Introduction: "阿瑟·柯南·道尔一共写了四部中篇、五十六部短篇福尔摩斯系列小说。这书致力于按出版顺序，原出版物格式收集他的所有著作。"
 *           Index:
 *             - Title: "一、演绎法的研究"
 *               OrderNum: 1
 *               VolumeId: 53
 *               BookId: 209
 *               IsHasContent: 1
 *               IndexId: 49017
 *             - Title: "二、犯罪现场"
 *               OrderNum: 2
 *               VolumeId: 53
 *               BookId: 209
 *               IsHasContent: 1
 *               IndexId: 49018
 *           Volumes:
 *             - Title: "血字的研究"
 *               Introduction: "1887年11月出版的《血字的研究》是英国推理小说家阿瑟·柯南·道尔于1887年创作的中篇小说，这也是他第一本以夏洛克·福尔摩斯为主角的作品。"
 *               OrderNum: 52
 *               BookId: 209
 *               VolumeId: 52
 *             - Title: "四签名"
 *               Introduction: "《四签名》是英国推理小说家阿瑟·柯南·道尔创作的第二部中篇小说..."
 *               OrderNum: 53
 *               BookId: 209
 *               VolumeId: 53
 *
 *     BookDetailNotFound:
 *       summary: 图书不存在时的错误响应示例
 *       value:
 *         code: 40400
 *         msg: "书籍不存在"
 *         timestamp: "2026-08-14T10:00:00.000Z"
 *         data: null
 */