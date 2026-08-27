import nodemailer from 'nodemailer';
import { IEmailSender } from '../../2-application/ports/IEmailSender.js';

export class NodemailerEmailSender extends IEmailSender {
    /**
     * 发送邮件
     * @param {Object} params
     * @param {string} params.from - 发件人地址
     * @param {string} params.authPass - 发件人授权密码
     * @param {string} params.to - 收件人地址
     * @param {string} [params.subject] - 邮件主题
     * @param {string} [params.text] - 邮件正文
     * @param {Array<{filename: string, path: string}>} [params.attachments] - 附件列表
     * @returns {Promise<void>}
     */
    async sendMail({ from, authPass, to, subject, text, attachments = [] }) {
        if (!from || !authPass || !to) {
            throw new Error('发件人、授权密码和收件人为必填项');
        }

        // 从邮箱地址提取服务商（如 163.com -> 163）
        const service = this.#getService(from);

        const transporter = nodemailer.createTransport({
            service,
            auth: { user: from, pass: authPass },
        });

        const mailOptions = {
            from,
            to,
            subject: subject || 'EBook Workshop 发来的邮件',
            text: text || 'This email sent by EBook Workshop!',
            attachments: attachments.map(({ filename, path: filepath }) => ({
                filename,
                path: filepath,
            })),
        };

        await transporter.sendMail(mailOptions);
    }

    #getService(email) {
        const match = email.match(/(?<=@)[^.]+/);
        return match ? match[0] : '163';
    }
}