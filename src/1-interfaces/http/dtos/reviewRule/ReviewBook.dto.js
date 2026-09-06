/**
 * @swagger
 * components:
 *   schemas:
 *     TryReviewRequest:
 *       type: object
 *       description: 预览审核效果的请求体
 *       properties:
 *         chapterIds:
 *           type: array
 *           items:
 *             type: integer
 *           description: 要预览的章节 ID 列表
 *           example: [1, 2]
 *         regex:
 *           type: string
 *           description: 正则表达式（匹配模式）
 *           example: "foo"
 *         replace:
 *           type: string
 *           description: 替换文本
 *           example: "bar"
 *       required:
 *         - chapterIds
 *         - regex
 *         - replace
 *
 *     SaveReviewRequest:
 *       type: object
 *       description: 保存审核替换结果的请求体
 *       properties:
 *         bookId:
 *           type: integer
 *           description: 图书 ID
 *           example: 1
 *         regex:
 *           type: string
 *           description: 正则表达式
 *           example: "foo"
 *         replace:
 *           type: string
 *           description: 替换文本
 *           example: "bar"
 *         chapterIds:
 *           type: array
 *           items:
 *             type: integer
 *           description: 要应用的章节 ID 列表
 *           example: [1, 2]
 *       required:
 *         - bookId
 *         - regex
 *         - replace
 *         - chapterIds
 *
 *   examples:
 *     TryReviewRequestExample:
 *       summary: 预览审核效果请求示例
 *       value:
 *         chapterIds: [1, 2]
 *         regex: "foo"
 *         replace: "bar"
 *
 *     SaveReviewRequestExample:
 *       summary: 保存审核替换请求示例
 *       value:
 *         bookId: 1
 *         regex: "foo"
 *         replace: "bar"
 *         chapterIds: [1, 2]
 *
 *   parameters:
 *     SuspiciousChapterIdsQuery:
 *       in: query
 *       name: chapterid
 *       schema:
 *         type: string
 *         description: 逗号分隔的章节 ID 列表
 *         example: "1,2"
 *       required: true
 *       description: 要检查的章节 ID（多个用逗号分隔）
 */