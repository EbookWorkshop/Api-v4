/**
 * @swagger
 * components:
 *   schemas:
 *     StorageBookItem:
 *       type: object
 *       description: 存储库中的图书信息
 *       properties:
 *         BookName:
 *           type: string
 *           description: 书名
 *           example: "福尔摩斯探案全集"
 *         Source:
 *           type: string
 *           description: 图书来源（如网站域名或来源标识）
 *           example: "www.example.com"
 *         CoverImage:
 *           type: string
 *           nullable: true
 *           description: 封面图片地址（可能为 null）
 *           example: "/Cover/福尔摩斯探案全集.jpg"
 *         Author:
 *           type: string
 *           description: 作者
 *           example: "阿瑟·柯南·道尔"
 *         Host:
 *           type: string
 *           description: 主机名
 *           example: "www.example.com"
 *       required:
 *         - BookName
 *         - Source
 *         - Author
 *         - Host
 *
 *     StorageBookListResponse:
 *       allOf:
 *         - $ref: '#/components/schemas/ApiResponse'
 *         - type: object
 *           properties:
 *             data:
 *               type: array
 *               items:
 *                 $ref: '#/components/schemas/StorageBookItem'
 *       required:
 *         - data
 *
 *   examples:
 *     StorageBookListSuccess:
 *       summary: 存储库图书列表成功响应示例
 *       value:
 *         code: 20000
 *         msg: "success"
 *         timestamp: "2026-10-07T10:00:00.000Z"
 *         data:
 *           - BookName: "福尔摩斯探案全集"
 *             Source: "www.example.com"
 *             CoverImage: "/Cover/福尔摩斯探案全集.jpg"
 *             Author: "阿瑟·柯南·道尔"
 *             Host: "www.example.com"
 *
 *     StorageBookListEmpty:
 *       summary: 无数据时的响应示例
 *       value:
 *         code: 20000
 *         msg: "success"
 *         timestamp: "2026-10-07T10:00:00.000Z"
 *         data: []
 */