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
}