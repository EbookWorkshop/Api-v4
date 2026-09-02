/**
 * @swagger
 * components:
 *   schemas:
 *     WebBookChapterSourceItem:
 *       type: object
 *       description: 网页图书章节源信息
 *       properties:
 *         id:
 *           type: integer
 *           description: 源记录 ID
 *           example: 332
 *         Path:
 *           type: string
 *           description: 章节源 URL 地址
 *           example: "https://www.aa.bb/page/to/read"
 *         WebBookIndexId:
 *           type: integer
 *           description: 关联的网页章节索引 ID
 *           example: 47910
 *       required:
 *         - id
 *         - Path
 *         - WebBookIndexId
 *
 *     WebBookChapterSourceListResponse:
 *       allOf:
 *         - $ref: '#/components/schemas/ApiResponse'
 *         - type: object
 *           properties:
 *             data:
 *               type: array
 *               items:
 *                 $ref: '#/components/schemas/WebBookChapterSourceItem'
 *       required:
 *         - data
 *
 *   examples:
 *     WebBookChapterSourceListSuccess:
 *       summary: 网页章节源列表成功响应示例
 *       value:
 *         code: 20000
 *         msg: "success"
 *         timestamp: "2026-08-31T12:00:00.000Z"
 *         data:
 *           - id: 332
 *             Path: "https://www.aa.bb/page/to/read"
 *             WebBookIndexId: 47910
 *           - id: 333
 *             Path: "https://www.aa.bb/page/to/read2"
 *             WebBookIndexId: 47911
 */

/**
 * @swagger
 * components:
 *   schemas:
 *     UpsertWebBookChapterSourceRequest:
 *       type: object
 *       description: 更新网页章节源的请求体
 *       properties:
 *         id:
 *           type: integer
 *           description: 章节源网址记录ID
 *           example: 332
 *         url:
 *           type: string
 *           description: 章节源 URL 地址
 *           example: "https://www.aa.bb/page/to/read"
 *       required:
 *         - url
 *         - id
 *
 *   examples:
 *     UpsertWebBookChapterSourceRequestExample:
 *       summary: 创建章节源请求示例（新增）
 *       value:
 *         url: "https://www.aa.bb/page/to/read"
 *
 *     UpsertWebBookChapterSourceUpdateExample:
 *       summary: 更新章节源请求示例
 *       value:
 *         id: 332
 *         url: "https://www.aa.bb/page/to/read_new"
 */

/**
 * @swagger
 * components:
 *   schemas:
 *     DefaultChapterSourceResponse:
 *       allOf:
 *         - $ref: '#/components/schemas/ApiResponse'
 *         - type: object
 *           properties:
 *             data:
 *               type: string
 *               description: 默认章节源 URL
 *               example: "https://aaa.bb.com/page/to/show/"
 *       required:
 *         - data
 */