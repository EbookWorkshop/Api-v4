/**
 * @swagger
 * components:
 *   schemas:
 *     BookListResponse:
 *       type: object
 *       properties:
 *         code:
 *           type: integer
 *           example: 0
 *         data:
 *           type: array
 *           items:
 *             type: object
 *             properties:
 *               id:
 *                 type: integer
 *               bookName:
 *                 type: string
 *               author:
 *                 type: string
 *               hotness:
 *                 type: integer
 *               createdAt:
 *                 type: string
 *                 format: date-time
 *         msg:
 *           type: string
 *           example: success
 */
export class BookListResponse {}
