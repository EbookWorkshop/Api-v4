/**
 * @swagger
 * components:
 *   schemas:
 *     ReviewBookRuleItem:
 *       type: object
 *       description: 图书与校阅规则的关联记录
 *       properties:
 *         id:
 *           type: integer
 *           description: 关联记录 ID
 *           example: 1
 *         bookId:
 *           type: integer
 *           description: 图书 ID
 *           example: 66
 *         bookName:
 *           type: string
 *           description: 图书名称
 *           example: "福尔摩斯探案全集"
 *         ruleId:
 *           type: integer
 *           description: 校阅规则 ID
 *           example: 10
 *         ruleName:
 *           type: string
 *           description: 校阅规则名称
 *           example: "敏感词过滤"
 *       required:
 *         - id
 *         - bookId
 *         - bookName
 *         - ruleId
 *         - ruleName
 *
 *     ReviewBookRuleListResponse:
 *       allOf:
 *         - $ref: '#/components/schemas/ApiResponse'
 *         - type: object
 *           properties:
 *             data:
 *               type: array
 *               items:
 *                 $ref: '#/components/schemas/ReviewBookRuleItem'
 *       required:
 *         - data
 *
 *   examples:
 *     ReviewBookRuleListSuccess:
 *       summary: 图书校阅规则关联列表成功响应示例
 *       value:
 *         code: 20000
 *         msg: "success"
 *         timestamp: "2026-08-30T10:00:00.000Z"
 *         data:
 *           - id: 1
 *             bookId: 66
 *             bookName: "福尔摩斯探案全集"
 *             ruleId: 10
 *             ruleName: "敏感词过滤"
 *           - id: 2
 *             bookId: 66
 *             bookName: "福尔摩斯探案全集"
 *             ruleId: 12
 *             ruleName: "广告屏蔽"
 *
 *     ReviewBookRuleListEmpty:
 *       summary: 无关联记录时的响应示例
 *       value:
 *         code: 20000
 *         msg: "success"
 *         timestamp: "2026-08-30T10:00:00.000Z"
 *         data: []
 */

/**
 * @swagger
 * components:
 *   schemas:
 *     AddBookRuleRequest:
 *       type: object
 *       description: 为图书关联校阅规则的请求体
 *       properties:
 *         bookId:
 *           type: integer
 *           description: 图书 ID
 *           example: 66
 *         ruleId:
 *           type: integer
 *           description: 校阅规则 ID
 *           example: 10
 *       required:
 *         - bookId
 *         - ruleId
 *
 *   examples:
 *     AddBookRuleRequestExample:
 *       summary: 关联校阅规则请求示例
 *       value:
 *         bookId: 66
 *         ruleId: 10
 */