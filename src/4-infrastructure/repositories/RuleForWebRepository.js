import sequelize, { Op } from "sequelize";
export class RuleForWebRepository {
    #RuleForWebModel;

    constructor(sequelize) {
        this.#RuleForWebModel = sequelize.models.RuleForWeb;
    }

    /**
     * 获取站点列表
     * @returns 
     */
    async getHostList() {
        const hosts = await this.#RuleForWebModel.findAll({
            attributes: [[sequelize.fn('DISTINCT', sequelize.col('Host')), 'Host']],
            order: [["updatedAt", "DESC"]],
            raw: true
        });
        return hosts.map(item => item.Host);
    }
}