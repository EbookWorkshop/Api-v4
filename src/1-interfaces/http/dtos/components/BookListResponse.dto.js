/**
 * @swagger
 * components:
 *   schemas:
 *     BookListItem:
 *       type: object
 *       properties:
 *         id:
 *           type: integer
 *           description: 图书唯一 ID
 *           example: 209
 *         BookName:
 *           type: string
 *           description: 图书名称
 *           example: "福尔摩斯探案全集"
 *         Author:
 *           type: string
 *           description: 作者
 *           example: "阿瑟·柯南·道尔"
 *         CoverImg:
 *           type: string
 *           nullable: true
 *           description: 封面图片路径，可能为 null
 *           example: "#f2e3a4"
 *         Hotness:
 *           type: integer
 *           description: 热度值
 *           example: 192
 *         TotalWord:
 *           type: integer
 *           description: 总字数
 *           example: 1062585
 *         createdAt:
 *           type: string
 *           format: date-time
 *           description: 创建时间（ISO 8601）
 *           example: "2026-01-13T03:43:40.705Z"
 *         updatedAt:
 *           type: string
 *           format: date-time
 *           description: 更新时间（ISO 8601）
 *           example: "2026-08-07T08:12:04.748Z"
 *
 *     BookListResponse:
 *       allOf:
 *         - $ref: '#/components/schemas/ApiResponse'
 *         - type: object
 *           properties:
 *             data:
 *               type: array
 *               items:
 *                 $ref: '#/components/schemas/BookListItem'
 *               description: 图书列表数据
 *       required:
 *         - data
 *
 *   examples:
 *     BookListSuccess:
 *       summary: 图书列表成功响应示例
 *       description: 包含两条图书记录的完整响应
 *       value:
 *         code: 20000
 *         msg: "success"
 *         timestamp: "2026-08-13T12:00:00.000Z"
 *         data:
 *           - id: 209
 *             BookName: "福尔摩斯探案全集"
 *             Author: "阿瑟·柯南·道尔"
 *             CoverImg: "#f2e3a4"
 *             Hotness: 192
 *             TotalWord: 1062585
 *             createdAt: "2026-01-13T03:43:40.705Z"
 *             updatedAt: "2026-08-07T08:12:04.748Z"
 *
 *     BookListEmpty:
 *       summary: 图书列表为空时的响应示例
 *       value:
 *         code: 20000
 *         msg: "success"
 *         timestamp: "2026-08-13T12:00:00.000Z"
 *         data: []
 */