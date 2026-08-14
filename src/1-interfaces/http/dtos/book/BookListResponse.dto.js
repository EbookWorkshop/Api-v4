/**
 * @swagger
 * components:
 *   schemas:
 *     BookListResponse:
 *       allOf:
 *         - $ref: '#/components/schemas/ApiResponse'
 *         - type: object
 *           properties:
 *             data:
 *               type: array
 *               items:
 *                 $ref: '#/components/schemas/BookListItem'
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
 *           - BookId: 209
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