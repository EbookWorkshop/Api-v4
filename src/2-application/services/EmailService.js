import { EMAIL_SETTING_GROUP, KINDLE_INBOX } from '../../3-domain/constants/SystemConfigGroup.js';
import { AppError,UserInputError } from '../../5-shared/errors/index.js';
import { IEmailSender } from '../ports/IEmailSender.js';

export class EmailService {
    /** @type {IEmailSender} */
    #emailSender;
    #systemConfigService;
    #transaction;

    /**
     * @param {IEmailSender} emailSender - 依赖注入邮件发送适配器
     * @param {*} systemConfigService - 配置服务
     */
    constructor(emailSender, systemConfigService, transaction) {
        this.#emailSender = emailSender;
        this.#systemConfigService = systemConfigService;
        this.#transaction = transaction;
    }

    // ---------- 配置读写 ----------
    async getInboxAddress() {
        const address = await this.#systemConfigService.getConfig(KINDLE_INBOX, "address");
        return { address };
    }

    async saveInboxAddress(address) {
        await this.#systemConfigService.setConfig(KINDLE_INBOX, "address", address);
        return { address };
    }

    async getEmailAccount() {
        const account = await this.#systemConfigService.getConfigGroup(EMAIL_SETTING_GROUP);
        const result = {};
        for (const row of account) {
            result[row.Name] = row.Value;
        }
        return result;
    }

    /**
     * 保存发件邮箱的 地址、密码
     * @param {*} address 邮箱地址
     * @param {*} password 密码
     */
    async saveEmailAccount(address, password) {
        return this.#transaction.runInTransaction(async (transaction) => {
            await this.#systemConfigService.setConfig(EMAIL_SETTING_GROUP, 'address', address, { transaction });
            await this.#systemConfigService.setConfig(EMAIL_SETTING_GROUP, 'password', password, { transaction });
            return { address, password };
        });
    }

    /**
     * @param {Object} params
     * @param {string} params.title
     * @param {string} params.content
     * @param {Array<{filename: string, filepath: string}>} params.files
     * @param {string} [params.mailto]
     * @param {string} [params.sender]
     * @param {string} [params.pass]
     */
    async sendEmail({ title, content, files, mailto, sender, pass }) {
        // 1. 补全缺省配置
        if (!mailto) {
            const inbox = await this.getInboxAddress();
            mailto = inbox.address;
        }
        if (!sender || !pass) {
            const account = await this.getEmailAccount();
            if (!sender) sender = account.address;
            if (!pass) pass = account.password;
        }

        // 2. 校验必填项
        if (!sender || !mailto || !pass) {
            const missing = [];
            if (!sender) missing.push('发件邮箱');
            if (!mailto) missing.push('收件邮箱');
            if (!pass) missing.push('发件邮箱授权密码');
            throw new UserInputError(`邮箱配置不完整，请先设置：${missing.join('、')}`);
        }

        // 3. 转换附件格式
        const attachments = (files || []).map((f) => ({
            filename: f.originalFilename || f.filename || '附件',
            path: f.filepath || f.path,
        }));

        // 4. 调用端口（适配器）
        await this.#emailSender.sendMail({
            from: sender,
            authPass: pass,
            to: mailto,
            subject: title || 'EBook Workshop 发送的邮件',
            text: content || 'This email sent by EBook Workshop!',
            attachments,
        });

        return { success: true };
    }
}