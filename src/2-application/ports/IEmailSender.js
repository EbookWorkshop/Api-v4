/**
 * 邮件发送端口（应用层依赖的抽象）
 */
export class IEmailSender {
    /**
     * 发送邮件
     * @param {Object} params
     * @param {string} params.from - 发件人地址
     * @param {string} params.authPass - 发件人授权密码
     * @param {string} params.to - 收件人地址
     * @param {string} params.subject - 邮件主题
     * @param {string} params.text - 邮件正文
     * @param {Array<{filename: string, path: string}>} params.attachments - 附件列表
     * @returns {Promise<void>}
     */
    async sendMail(params) {
        throw new Error('Method not implemented');
    }
}