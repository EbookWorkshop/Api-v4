export class EmailController {
    #emailService;

    constructor(emailService) {
        this.#emailService = emailService;
    }

    /**
     * @swagger
     * /services/email/inbox:
     *   get:
     *     summary: 获取收件邮箱地址
     *     description: 返回当前系统配置的收件邮箱地址（统一包装格式）
     *     tags:
     *       - Services - EMail —— 系统服务：邮件
     *       - Email
     *     responses:
     *       200:
     *         description: 成功返回邮箱地址
     *         content:
     *           application/json:
     *             schema:
     *               $ref: '#/components/schemas/EmailInboxResponse'
     *             example:
     *               code: 20000
     *               msg: "success"
     *               timestamp: "2026-08-20T19:00:00.000Z"
     *               data:
     *                 address: "mybook@mailbox.com"
     *       500:
     *         description: 服务器内部错误
     */
    async getInboxEmail(ctx) {
        ctx.body = await this.#emailService.getInboxAddress();
    }
}
