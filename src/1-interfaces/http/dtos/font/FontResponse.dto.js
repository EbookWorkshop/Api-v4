/**
 * @swagger
 * components:
 *   schemas:
 *     FontInfo:
 *       type: object
 *       description: 字体信息
 *       properties:
 *         name:
 *           type: string
 *           description: 字体名称
 *           example: "宋体"
 *         url:
 *           type: string
 *           description: 字体文件 URL
 *           example: "/font/宋体.ttf"
 *       required:
 *         - name
 *         - url
 *
 *     FontUIResponse:
 *       allOf:
 *         - $ref: '#/components/schemas/ApiResponse'
 *         - type: object
 *           properties:
 *             data:
 *               $ref: '#/components/schemas/FontInfo'
 *       required:
 *         - data
 *
 *   examples:
 *     FontUISuccess:
 *       summary: 字体信息成功响应示例
 *       value:
 *         code: 20000
 *         msg: "success"
 *         timestamp: "2026-08-15T12:00:00.000Z"
 *         data:
 *           name: "宋体"
 *           url: "/font/宋体.ttf"
 */

/**
 * @swagger
 * components:
 *   schemas:
 *     FontItem:
 *       type: object
 *       description: 字体文件信息
 *       properties:
 *         url:
 *           type: string
 *           description: 字体文件访问 URL
 *           example: "/font/宋体.woff"
 *         size:
 *           type: integer
 *           description: 字体文件大小（字节）
 *           example: 6394236
 *         name:
 *           type: string
 *           description: 字体名称
 *           example: "宋体"
 *       required:
 *         - url
 *         - size
 *         - name
 *
 *     FontListResponse:
 *       allOf:
 *         - $ref: '#/components/schemas/ApiResponse'
 *         - type: object
 *           properties:
 *             data:
 *               type: array
 *               items:
 *                 $ref: '#/components/schemas/FontItem'
 *       required:
 *         - data
 *
 *   examples:
 *     FontListSuccess:
 *       summary: 字体列表成功响应示例
 *       value:
 *         code: 20000
 *         msg: "success"
 *         timestamp: "2026-08-19T10:00:00.000Z"
 *         data:
 *           - url: "/font/宋体.woff"
 *             size: 6394236
 *             name: "宋体"
 *           - url: "/font/黑体.woff"
 *             size: 8123456
 *             name: "黑体"
 *
 *     FontListEmpty:
 *       summary: 字体列表为空时的响应示例
 *       value:
 *         code: 20000
 *         msg: "success"
 *         timestamp: "2026-08-19T10:00:00.000Z"
 *         data: []
 */