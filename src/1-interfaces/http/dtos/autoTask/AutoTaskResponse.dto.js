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