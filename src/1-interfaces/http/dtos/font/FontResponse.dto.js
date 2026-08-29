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

/**
 * @swagger
 * components:
 *   schemas:
 *     FontReadingResponse:
 *       allOf:
 *         - $ref: '#/components/schemas/ApiResponse'
 *         - type: object
 *           properties:
 *             data:
 *               type: string
 *               description: 阅读字体名称
 *               example: "宋体"
 *           required:
 *             - data
 *
 *   examples:
 *     FontReadingSuccess:
 *       summary: 阅读字体成功响应示例
 *       value:
 *         code: 20000
 *         msg: "success"
 *         timestamp: "2026-08-18T16:25:12.189Z"
 *         data: "宋体"
 */

/**
 * @swagger
 * components:
 *   schemas:
 *     RenameFontRequest:
 *       type: object
 *       description: 重命名字体文件的请求体
 *       properties:
 *         fontFile:
 *           type: string
 *           description: 当前字体文件名（含扩展名）
 *           example: "宋体.ttf"
 *         newName:
 *           type: string
 *           description: 新字体文件名（含扩展名）
 *           example: "新宋体.ttf"
 *       required:
 *         - fontFile
 *         - newName
 *
 *     SetFontRequest:
 *       type: object
 *       description: 设置默认字体的请求体（适用于阅读字体和UI字体）
 *       properties:
 *         fontName:
 *           type: string
 *           description: 字体名称（需与系统字体名称一致）
 *           example: "宋体"
 *       required:
 *         - fontName
 *
 *   examples:
 *     RenameFontRequestExample:
 *       summary: 重命名字体请求示例
 *       value:
 *         fontFile: "宋体.ttf"
 *         newName: "新宋体.ttf"
 *
 *     SetReadingFontRequestExample:
 *       summary: 设置阅读字体请求示例
 *       value:
 *         fontName: "宋体"
 *
 *     SetUIFontRequestExample:
 *       summary: 设置UI字体请求示例
 *       value:
 *         fontName: "宋体"
 *
 *     FontDeleteSuccess:
 *       summary: 删除字体成功响应示例
 *       value:
 *         code: 20000
 *         msg: "success"
 *         timestamp: "2026-08-29T10:00:00.000Z"
 *         data:
 *           success: true
 */