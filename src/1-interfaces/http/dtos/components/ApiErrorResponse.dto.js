/**
 * @swagger
 * components:
 *   schemas:
 *     ApiErrorResponse:
 *       allOf:
 *         - $ref: '#/components/schemas/ApiResponse'
 *         - type: object
 *           properties:
 *             code:
 *               description: 50000代表服务器执行失败，60000代表用户引起的失败（如输入错误类型等）。
 *               example: 50000
 *             msg:
 *               description: 错误具体信息
 *               example: "错误的具体描述"
 *             stack:
 *               description: 出错堆栈信息，开发环境才提供
 *               example: "调试时常见的堆栈信息。" 
 *           required:
 *             - code
 *             - msg
 *             - timestamp
 */