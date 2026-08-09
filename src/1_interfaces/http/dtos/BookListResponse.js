/**
 * @swagger
 * components:
 *   schemas:
 *     BookListResponse:
 *       type: object
 *       properties:
 *         success:
 *           type: boolean
 *           example: true
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
 *         total:
 *           type: integer
 */
export class BookListResponse {}
