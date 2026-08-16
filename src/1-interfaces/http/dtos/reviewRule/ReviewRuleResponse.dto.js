/**
 * @swagger
 * components:
 *   schemas:
 *     ReviewRuleItem:
 *       type: object
 *       description: 校阅规则条目
 *       properties:
 *         id:
 *           type: integer
 *           description: 规则唯一 ID
 *           example: 10
 *         Name:
 *           type: string
 *           description: 规则名称
 *           example: "规则名"
 *         Rule:
 *           type: string
 *           description: 匹配规则（正则表达式或关键词）
 *           example: "敏感词.*"
 *         Replace:
 *           type: string
 *           description: 替换内容
 *           example: "***"
 *         Count:
 *           type: integer
 *           description: 被引用次数（例如在校阅任务中使用次数）
 *           example: 71
 *       required:
 *         - id
 *         - Name
 *         - Rule
 *         - Replace
 *         - Count
 *
 *     ReviewRuleListResponse:
 *       allOf:
 *         - $ref: '#/components/schemas/ApiResponse'
 *         - type: object
 *           properties:
 *             data:
 *               type: array
 *               items:
 *                 $ref: '#/components/schemas/ReviewRuleItem'
 *       required:
 *         - data
 *
 *   examples:
 *     ReviewRuleListSuccess:
 *       summary: 校阅规则列表成功响应示例
 *       value:
 *         code: 20000
 *         msg: "success"
 *         timestamp: "2026-08-16T12:00:00.000Z"
 *         data:
 *           - id: 10
 *             Name: "规则名"
 *             Rule: "匹配用正则表达式"
 *             Replace: "***"
 *             Count: 71
 *           - id: 11
 *             Name: "广告过滤"
 *             Rule: "https?://.*"
 *             Replace: ""
 *             Count: 34
 *
 *     ReviewRuleListEmpty:
 *       summary: 校阅规则列表为空时的响应示例
 *       value:
 *         code: 20000
 *         msg: "success"
 *         timestamp: "2026-08-16T12:00:00.000Z"
 *         data: []
 */