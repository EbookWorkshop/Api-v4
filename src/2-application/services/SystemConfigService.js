export class SystemConfigService {
    #systemConfigRepository;

    constructor(systemConfigRepository) {
        this.#systemConfigRepository = systemConfigRepository;
    }

    /**
     * 获取配置值
     * @param {string} group - 分组常量
     * @param {string} name - 配置名
     * @param {object} options - 可选事务
     * @returns {Promise<string|null>}
     */
    async getConfig(group, name, options = {}) {
        return await this.#systemConfigRepository.findValue(group, name, options);
    }

    /**
     * 设置配置值
     * @param {string} group
     * @param {string} name
     * @param {string} value
     * @param {object} options
     * @returns {Promise<{ group: string, name: string, value: string }>} DTO
     */
    async setConfig(group, name, value, options = {}) {
        const { record } = await this.#systemConfigRepository.upsert(group, name, value, options);
        // 返回 DTO，避免暴露 ORM 模型
        return {
            group: record.Group,
            name: record.Name,
            value: record.Value,
        };
    }

    /**
     * 删除配置
     * @param {string} group
     * @param {string} name
     * @param {object} options
     * @returns {Promise<boolean>} 是否删除成功（删除行数 > 0）
     */
    async deleteConfig(group, name, options = {}) {
        const deletedCount = await this.#systemConfigRepository.destroy(group, name, options);
        return deletedCount > 0;
    }


}