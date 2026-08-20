import { SystemConfigService } from "./SystemConfigService.js"
import { KINDLE_INBOX, EMAIL_SETTING_GROUP } from "../../3-domain/constants/SystemConfigGroup.js";

export class EmailService {
    #systemConfigService;

    /**
     * 
     * @param {SystemConfigService} systemConfigService 
     */
    constructor(systemConfigService) {
        this.#systemConfigService = systemConfigService;
    }

    /**
     * 获取默认邮箱地址
     */
    async getInboxAddress() {
        let inboxInfo = await this.#systemConfigService.getConfig(KINDLE_INBOX, "address");
        return { "address": inboxInfo };
    }

    /**
     * 获取发送邮箱信息
     */
    async getEmailAccount() {
        let account = await this.#systemConfigService.getConfigGroup(EMAIL_SETTING_GROUP);
        const result = {};
        for (let row of account) {
            result[row.Name] = row.Value;
        }
        return result;
    }
}