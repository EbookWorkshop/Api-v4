/**
 * @swagger
 * components:
 *   schemas:
 *     BookMetadataResponse:
 *       allOf:
 *         - $ref: '#/components/schemas/ApiResponse'
 *         - type: object
 *           properties:
 *             data:
 *               $ref: '#/components/schemas/BookMetadata'
 *       required:
 *         - data
 *
 *   examples:
 *     BookMetadataSuccess:
 *       summary: 图书元数据成功响应示例
 *       value:
 *         code: 20000
 *         msg: "success"
 *         timestamp: "2026-08-14T10:00:00.000Z"
 *         data:
 *           id: 209
 *           BookName: "福尔摩斯探案全集"
 *           Author: "阿瑟·柯南·道尔"
 *           CoverImg: "#f2e3a4"
 *           Hotness: 192
 *           TotalWord: 1062585
 *           createdAt: "2026-01-13T03:43:40.705Z"
 *           updatedAt: "2026-08-07T08:12:04.748Z"
 *           Introduction: "阿瑟·柯南·道尔一共写了四部中篇、五十六部短篇福尔摩斯系列小说。这书致力于按出版顺序，原出版物格式收集他的所有著作。"
 */