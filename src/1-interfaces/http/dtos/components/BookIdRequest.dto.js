/**
 * @swagger
 * components:
 *   parameters:
 *     BookIdQuery:
 *       in: query
 *       name: bookid
 *       schema:
 *         type: integer
 *         minimum: 1
 *       required: true
 *       description: 图书 ID，必须为正整数
 *       example: 1
  *     BookIdCamelCaseQuery:
 *       in: query
 *       name: bookId
 *       schema:
 *         type: integer
 *         minimum: 1
 *       required: true
 *       description: 图书 ID，必须为正整数。参数是驼峰式的。
 *       example: 1
 */