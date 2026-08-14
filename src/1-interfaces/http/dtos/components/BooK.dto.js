/**
 * @swagger
 * components:
 *   schemas:
 *     BookInfoBase:
 *       type: object
 *       description: 图书基础信息（不含 ID，适用于某些摘要接口）
 *       properties:
 *         BookName:
 *           type: string
 *           example: "福尔摩斯探案全集"
 *         Author:
 *           type: string
 *           example: "阿瑟·柯南·道尔"
 *         CoverImg:
 *           type: string
 *           nullable: true
 *           example: "/Cover/xxx.jpg"
 *         Hotness:
 *           type: integer
 *           example: 192
 *         TotalWord:
 *           type: integer
 *           example: 1062585
 *         createdAt:
 *           type: string
 *           format: date-time
 *           example: "2026-01-13T03:43:40.705Z"
 *         updatedAt:
 *           type: string
 *           format: date-time
 *           example: "2026-08-07T08:12:04.748Z"
 *       required:
 *         - BookName
 *         - Author
 *         - Hotness
 *         - TotalWord
 *         - createdAt
 *         - updatedAt
 *
 *     BookBase:
 *       allOf:
 *         - type: object
 *           properties:
 *             id:
 *               type: integer
 *               description: 图书唯一 ID
 *               example: 209
 *           required:
 *             - id
 *         - $ref: '#/components/schemas/BookInfoBase'
 *     BookListItem:
 *       allOf:
 *         - type: object
 *           properties:
 *             BookId:
 *               type: integer
 *               description: 图书唯一 ID
 *               example: 209
 *           required:
 *             - BookId
 *         - $ref: '#/components/schemas/BookInfoBase'

 *     BookMetadata:
 *       allOf:
 *         - $ref: '#/components/schemas/BookBase'
 *         - type: object
 *           properties:
 *             Introduction:
 *               type: string
 *               description: 图书简介
 *               example: "阿瑟·柯南·道尔一共写了四部中篇、五十六部短篇福尔摩斯系列小说。这书致力于按出版顺序，原出版物格式收集他的所有著作。"
 *           required:
 *             - Introduction
*/