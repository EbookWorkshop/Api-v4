/**
 * @swagger
 * components:
 *   schemas:
 *     EmailAccount:
 *       type: object
 *       description: 邮箱账号信息
 *       properties:
 *         address:
 *           type: string
 *           description: 邮箱地址
 *           example: "ab@c.com"
 *         password:
 *           type: string
 *           description: 邮箱密码（通常脱敏显示）
 *           example: "**"
 *       required:
 *         - address
 *         - password
 *
 *     EmailAccountResponse:
 *       allOf:
 *         - $ref: '#/components/schemas/ApiResponse'
 *         - type: object
 *           properties:
 *             data:
 *               $ref: '#/components/schemas/EmailAccount'
 *       required:
 *         - data
 */