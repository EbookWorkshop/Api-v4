/**
 * @swagger
 * components:
 *   schemas:
 *     SaveAutoTaskRequest:
 *       type: object
 *       description: 保存自动任务的请求体
 *       properties:
 *         type:
 *           type: string
 *           description: 任务类型（对应 TASK_TYPES 中的键名）
 *           example: "SYSTEM_VERSION"
 *         cron:
 *           type: string
 *           description: 定时表达式（6 位：秒 分 时 日 月 周）
 *           example: "0 0 3 * * *"
 *         enabled:
 *           type: boolean
 *           description: 是否启用，默认 true
 *           example: true
 *         descript:
 *           type: string
 *           description: 任务描述
 *           example: "每日凌晨更新版本"
 *         param:
 *           type: object
 *           description: 任务附加参数（不同任务类型结构不同）
 *           example: {}
 *       required:
 *         - type
 *         - cron
 *
 *     SaveAutoTaskResult:
 *       type: object
 *       description: 保存任务的执行结果
 *       properties:
 *         ok:
 *           type: boolean
 *           description: 是否保存成功
 *           example: true
 *         error:
 *           type: object
 *           nullable: true
 *           description: 当 ok 为 false 时携带的错误信息
 *       required:
 *         - ok
 *
 *     EditAutoTaskRequest:
 *       type: object
 *       description: 修改（启用/禁用）自动任务的请求体
 *       properties:
 *         type:
 *           type: string
 *           description: 任务类型（对应 TASK_TYPES 中的键名）
 *           example: "SYSTEM_VERSION"
 *         enabled:
 *           type: boolean
 *           description: 是否启用；不传时执行其它编辑逻辑（当前返回未实现占位）
 *           example: true
 *       required:
 *         - type
 *
 *   examples:
 *     SaveAutoTaskRequestExample:
 *       summary: 保存自动任务请求示例
 *       value:
 *         type: "SYSTEM_VERSION"
 *         cron: "0 0 3 * * *"
 *         enabled: true
 *         descript: "每日凌晨更新版本"
 *
 *     SaveAutoTaskSuccess:
 *       summary: 保存任务成功响应示例
 *       value:
 *         code: 20000
 *         msg: "success"
 *         timestamp: "2026-08-30T20:00:00.000Z"
 *         data:
 *           ok: true
 *
 *     SaveAutoTaskFail:
 *       summary: 保存任务逻辑失败响应示例（仍返回 HTTP 200）
 *       value:
 *         code: 20000
 *         msg: "success"
 *         timestamp: "2026-08-30T20:00:00.000Z"
 *         data:
 *           ok: false
 *           error:
 *             message: "数据库写入失败"
 *
 *     EditAutoTaskRequestExample:
 *       summary: 修改自动任务请求示例
 *       value:
 *         type: "SYSTEM_VERSION"
 *         enabled: true
 */

/**
 * @swagger
 * components:
 *   schemas:
 *     ValidateCronRequest:
 *       type: object
 *       description: 校验 Cron 表达式的请求体
 *       properties:
 *         cron:
 *           type: string
 *           description: 要校验的 Cron 表达式（支持 5 段或 6 段格式）
 *           example: "0 0 12 * * ?"
 *       required:
 *         - cron
 *
 *     CronErrorItem:
 *       type: object
 *       description: Cron 校验错误项
 *       properties:
 *         field:
 *           type: string
 *           description: 出错的字段名（如 second、minute、hour 等）
 *           example: "hour"
 *         value:
 *           type: string
 *           description: 触发错误的值
 *           example: "25"
 *         message:
 *           type: string
 *           description: 错误描述
 *           example: "小时取值范围应为 0-23"
 *       required:
 *         - field
 *         - value
 *         - message
 *
 *     CronParsedFields:
 *       type: object
 *       description: 解析后的 Cron 字段值（每个字段为数值数组）
 *       properties:
 *         second:
 *           type: array
 *           items:
 *             type: integer
 *           description: 秒字段解析结果
 *           example: [0]
 *         minute:
 *           type: array
 *           items:
 *             type: integer
 *           description: 分字段解析结果
 *           example: [0]
 *         hour:
 *           type: array
 *           items:
 *             type: integer
 *           description: 小时字段解析结果
 *           example: [12]
 *         dayOfMonth:
 *           type: array
 *           items:
 *             type: integer
 *           description: 日字段解析结果
 *           example: [1, 2, 3]
 *         month:
 *           type: array
 *           items:
 *             type: integer
 *           description: 月字段解析结果
 *           example: [1, 2, 3]
 *         dayOfWeek:
 *           type: array
 *           items:
 *             type: integer
 *           description: 星期字段解析结果
 *           example: [1, 2, 3]
 *
 *     ValidateCronResult:
 *       type: object
 *       description: Cron 校验结果
 *       properties:
 *         valid:
 *           type: boolean
 *           description: 是否有效
 *           example: true
 *         errors:
 *           type: array
 *           items:
 *             $ref: '#/components/schemas/CronErrorItem'
 *           description: 错误列表（有效时为空数组）
 *           example: []
 *         fields:
 *           $ref: '#/components/schemas/CronParsedFields'
 *           description: 解析后的字段值（可选，仅当有效时返回）
 *       required:
 *         - valid
 *         - errors
 *
 *     ValidateCronResponse:
 *       allOf:
 *         - $ref: '#/components/schemas/ApiResponse'
 *         - type: object
 *           properties:
 *             data:
 *               $ref: '#/components/schemas/ValidateCronResult'
 *       required:
 *         - data
 *
 *   examples:
 *     ValidateCronRequestExample:
 *       summary: 校验 Cron 请求示例
 *       value:
 *         cron: "0 0 12 * * ?"
 *
 *     ValidateCronSuccess:
 *       summary: Cron 校验成功响应示例
 *       value:
 *         code: 20000
 *         msg: "success"
 *         timestamp: "2026-09-22T10:00:00.000Z"
 *         data:
 *           valid: true
 *           errors: []
 *           fields:
 *             second: [0]
 *             minute: [0]
 *             hour: [12]
 *             dayOfMonth: [1, 2, 3]
 *             month: [1, 2, 3]
 *             dayOfWeek: [1, 2, 3]
 *
 *     ValidateCronInvalid:
 *       summary: Cron 校验失败响应示例
 *       value:
 *         code: 20000
 *         msg: "success"
 *         timestamp: "2026-09-22T10:00:00.000Z"
 *         data:
 *           valid: false
 *           errors:
 *             - field: "hour"
 *               value: "25"
 *               message: "小时取值范围应为 0-23"
 */