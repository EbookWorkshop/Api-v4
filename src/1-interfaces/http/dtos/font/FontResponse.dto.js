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