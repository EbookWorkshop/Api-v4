/**
 * @swagger
 * components:
 *   schemas:
 *     WebBookBase:
 *       allOf:
 *         - $ref: '#/components/schemas/BookListItem'
 *         - type: object
 *           properties:
 *             WebBookName:
 *               type: string
 *               description: 网页版显示的书名
 *               example: "福尔摩斯探案全集"
 *             AutoSyncEnabled:
 *               type: boolean
 *               description: 是否启用自动同步
 *               example: true
 *             WebBookId:
 *               type: integer
 *               description: 网页版图书 ID（为将来扩展功能预留，暂未使用）
 *               example: 202
 *           required:
 *             - WebBookName
 *             - AutoSyncEnabled
 *             - WebBookId
 *
 *     WebBookListResponse:
 *       allOf:
 *         - $ref: '#/components/schemas/ApiResponse'
 *         - type: object
 *           properties:
 *             data:
 *               type: array
 *               items:
 *                 $ref: '#/components/schemas/WebBookBase'
 *       required:
 *         - data
 *
 *   examples:
 *     WebBookListSuccess:
 *       summary: 网页图书列表成功响应示例
 *       value:
 *         code: 20000
 *         msg: "success"
 *         timestamp: "2026-08-15T14:00:00.000Z"
 *         data:
 *           - BookId: 209
 *             BookName: "福尔摩斯探案全集"
 *             Author: "阿瑟·柯南·道尔"
 *             CoverImg: "/Cover/xx.jpg"
 *             Hotness: 192
 *             TotalWord: 1062585
 *             createdAt: "2026-01-13T03:43:40.705Z"
 *             updatedAt: "2026-08-07T08:12:04.748Z"
 *             WebBookName: "福尔摩斯探案全集（网页版）"
 *             AutoSyncEnabled: true
 *             WebBookId: 202
 *
 *     WebBookListEmpty:
 *       summary: 网页图书列表为空时的响应示例
 *       value:
 *         code: 20000
 *         msg: "success"
 *         timestamp: "2026-08-15T14:00:00.000Z"
 *         data: []
 */

/**
 * @swagger
 * components:
 *   schemas:
 *     WebBookDetail:
 *       allOf:
 *         - $ref: '#/components/schemas/WebBookBase'   # 含基础字段 + WebBook 扩展字段
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
 *     WebBookDetailResponse:
 *       allOf:
 *         - $ref: '#/components/schemas/ApiResponse'
 *         - type: object
 *           properties:
 *             data:
 *               $ref: '#/components/schemas/WebBookDetail'
 *       required:
 *         - data
 *
 *   examples:
 *     WebBookDetailSuccess:
 *       summary: 网页图书详情成功响应示例
 *       value:
 *         code: 20000
 *         msg: "success"
 *         timestamp: "2026-08-16T10:00:00.000Z"
 *         data:
 *           id: 289
 *           BookName: "福尔摩斯探案全集"
 *           Author: "阿瑟·柯南·道尔"
 *           CoverImg: "#f2e3a4"
 *           Hotness: 192
 *           TotalWord: 1062585
 *           createdAt: "2026-01-13T03:43:40.705Z"
 *           updatedAt: "2026-08-07T08:12:04.748Z"
 *           WebBookName: "福尔摩斯探案全集（网页版）"
 *           AutoSyncEnabled: true
 *           WebBookId: 202
 *           Introduction: "阿瑟·柯南·道尔一共写了四部中篇、五十六部短篇福尔摩斯系列小说。这书致力于按出版顺序，原出版物格式收集他的所有著作。"
 *           Index:
 *             - Title: "一、演绎法的研究"
 *               OrderNum: 1
 *               VolumeId: 53
 *               BookId: 289
 *               IsHasContent: 1
 *               IndexId: 49017
 *           Volumes:
 *             - Title: "血字的研究"
 *               Introduction: "1887年11月出版的《血字的研究》是英国推理小说家阿瑟·柯南·道尔于1887年创作的中篇小说，这也是他第一本以夏洛克·福尔摩斯为主角的作品。"
 *               OrderNum: 52
 *               BookId: 289
 *               createdAt: "2026-01-13T03:45:52.313Z"
 *               updatedAt: "2026-01-13T03:45:52.313Z"
 *               VolumeId: 52
 *
 *     WebBookDetailNotFound:
 *       summary: 网页图书不存在时的错误响应示例
 *       value:
 *         code: 40400
 *         msg: "书籍不存在/该书籍非网文类型"
 *         timestamp: "2026-08-16T10:00:00.000Z"
 *         data: null
 */

/**
 * @swagger
 * components:
 *   schemas:
 *     CreateWebBookRequest:
 *       type: object
 *       description: 创建网页图书的请求体
 *       properties:
 *         isEmbedBookName:
 *           type: boolean
 *           description: 是否嵌入书名到封面中
 *           example: true
 *         sourcePage:
 *           type: string
 *           description: 源页面 URL
 *           example: "https://www.example.com/source"
 *         infoPage:
 *           type: string
 *           description: 信息页面 URL
 *           example: "https://www.example.com/info"
 *       required:
 *         - sourcePage
 *
 *   examples:
 *     CreateWebBookRequestExample:
 *       summary: 创建网页图书请求示例
 *       value:
 *         isEmbedBookName: true
 *         sourcePage: "https://www.example.com/source"
 *         infoPage: "https://www.example.com/info"
 */

/**
 * @swagger
 * components:
 *   schemas:
 *     UpdateWebBookChapterRequest:
 *       type: object
 *       description: 批量更新网页图书章节的请求体
 *       properties:
 *         chapterIds:
 *           type: array
 *           description: 要更新的章节 ID 列表
 *           items:
 *             type: integer
 *           example: [101, 102, 103]
 *         isUpdate:
 *           type: boolean
 *           description: 是否执行覆盖更新
 *           example: true
 *       required:
 *         - chapterIds
 *         - isUpdate
 *
 *   examples:
 *     UpdateWebBookChapterRequestExample:
 *       summary: 更新网页图书章节请求示例
 *       value:
 *         chapterIds: [101, 102, 103]
 *         isUpdate: true
 */
