// src/4-infrastructure/repositories/SystemConfigRepository.js
export class SystemConfigRepository {
  #SystemConfigModel;

  constructor(sequelize) {
    this.#SystemConfigModel = sequelize.models.SystemConfig;
  }

  /**
   * 查找配置值
   * @param {string} group - 功能分组
   * @param {string} name - 配置名
   * @param {object} options - 可选项（如 transaction）
   * @returns {Promise<string|null>}
   */
  async findValue(group, name, options = {}) {
    const record = await this.#SystemConfigModel.findOne({
      where: { Group: group, Name: name },
      attributes: ['Value'],
      raw: true,
      transaction: options.transaction,
    });
    return record ? record.Value : null;
  }

  /**
   * 插入或更新配置（原子操作）
   * @param {string} group
   * @param {string} name
   * @param {string} value
   * @param {object} options
   * @returns {Promise<{ record: any, created: boolean }>}
   */
  async upsert(group, name, value, options = {}) {
    const [record, created] = await this.#SystemConfigModel.upsert(
      { Group: group, Name: name, Value: value },
      { transaction: options.transaction }
    );
    return { record, created };
  }

  /**
   * 删除配置
   * @param {string} group - 可为 null（只按 name 删除）
   * @param {string} name
   * @param {object} options
   * @returns {Promise<number>} 删除的行数
   */
  async destroy(group, name, options = {}) {
    const where = { Name: name };
    if (group) where.Group = group;
    return await this.#SystemConfigModel.destroy({
      where,
      transaction: options.transaction,
    });
  }
}