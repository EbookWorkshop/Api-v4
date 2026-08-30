/**
 * @swagger
 * components:
 *   schemas:
 *     ApiSuccessResponse:
 *       allOf:
 *         - $ref: '#/components/schemas/ApiResponse'
 *         - type: object
 *           properties:
 *             data:
 *               description: 描述成功的数据，boolean类型为是否执行成功，数字类型为实际影响数据行数。
 *               example: true
 *           required:
 *             - code
 *             - data
 *             - msg
 *             - timestamp
 * 
 *   examples:
 *     ResultListEmpty:
 *       summary: 结果列表为空时的响应示例
 *       value:
 *         code: 20000
 *         msg: "success"
 *         timestamp: "2026-08-29T14:00:00.000Z"
 *         data: []
 */