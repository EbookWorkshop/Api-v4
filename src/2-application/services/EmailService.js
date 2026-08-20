import { SystemConfigService } from "./SystemConfigService.js"
import { KINDLE_INBOX } from "../../3-domain/constants/SystemConfigGroup.js";

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
}