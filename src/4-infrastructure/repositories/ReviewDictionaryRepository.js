export class ReviewDictionaryRepository {
    #ReviewDictionaryModel;

    constructor(sequelize) {
        this.#ReviewDictionaryModel = sequelize.models.ReviewDictionary;
    }

    async findByHost(host) {
        return this.#ReviewDictionaryModel.findAll({
            where: { Host: host },
            raw: true   // 直接返回普通对象数组
        })
    }

    /**
     * 
     * @param {*} host 
     * @param {Array<Object>} data 
     */
    async batchUpsert(host, data, { transaction } = {}) {
        const updateInTran = async (transaction) => {
            await this.#ReviewDictionaryModel.destroy({
                where: { Host: host },
                transaction
            });
            const saveData = data.map(d => {
                return {
                    Host: host,
                    ExecuteType: d.ExecuteType,
                    Execute: d.Execute,
                    Data: d.Data,
                }
            })
            await this.#ReviewDictionaryModel.bulkCreate(saveData, { transaction });
            return true;
        };

        if (transaction) return updateInTran(transaction);

        const { sequelize } = this.#ReviewDictionaryModel;
        return sequelize.transaction(updateInTran);
    }

    async deleteByHost(host, { transaction } = {}) {
        const doInTran = async (transaction) => {
            return await this.#ReviewDictionaryModel.destroy({ where: { Host: host }, transaction });
        }

        if (transaction) return doInTran(transaction);
        const { sequelize } = this.#ReviewDictionaryModel;
        return sequelize.transaction(doInTran);
    }
}