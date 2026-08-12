/**
 * @swagger
 * components:
 *   schemas:
 *     ApiResponse:
 *       type: object
 *       properties:
 *         code:
 *           type: integer
 *           description: 业务状态码，成功时为 20000（即 HTTP 200 * 100）
 *           example: 20000
 *         msg:
 *           type: string
 *           description: 提示信息
 *           example: "success"
 *         timestamp:
 *           type: string
 *           format: date-time
 *           description: 响应时间戳（ISO 8601）
 *           example: "2026-08-13T12:00:00.000Z"
 *       required:
 *         - code
 *         - msg
 *         - timestamp
 */