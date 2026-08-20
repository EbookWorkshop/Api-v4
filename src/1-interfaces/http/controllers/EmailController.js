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

    /**
    * @swagger
    * /services/email/account:
    *   get:
    *     summary: 获取邮箱账号信息
    *     description: 返回当前配置的邮箱账号和密码（统一包装格式）
    *     tags:
    *       - Services - EMail —— 系统服务：邮件
    *       - Email
    *     responses:
    *       200:
    *         description: 成功返回账号信息
    *         content:
    *           application/json:
    *             schema:
    *               $ref: '#/components/schemas/EmailAccountResponse'
    *             example:
    *               code: 20000
    *               msg: "success"
    *               timestamp: "2026-08-20T20:00:00.000Z"
    *               data:
    *                 address: "ab@c.com"
    *                 password: "abcd"
    *       500:
    *         description: 服务器内部错误
    */
    async getEmailAccount(ctx) {
        ctx.body = await this.#emailService.getEmailAccount();
    }
}
