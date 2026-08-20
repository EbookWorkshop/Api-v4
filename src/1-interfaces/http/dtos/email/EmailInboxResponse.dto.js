/**
 * @swagger
 * components:
 *   schemas:
 *     EmailInbox:
 *       type: object
 *       description: 收件邮箱地址
 *       properties:
 *         address:
 *           type: string
 *           description: 邮箱地址
 *           example: "mybook@mailbox.com"
 *       required:
 *         - address
 *
 *     EmailInboxResponse:
 *       allOf:
 *         - $ref: '#/components/schemas/ApiResponse'
 *         - type: object
 *           properties:
 *             data:
 *               $ref: '#/components/schemas/EmailInbox'
 *       required:
 *         - data
 */