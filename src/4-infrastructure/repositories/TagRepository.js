import { Op } from "sequelize";
export class TagRepository {
    #TagModel;
    #EBookTag;

    constructor(sequelize) {
        this.#TagModel = sequelize.models.Tag;
        this.#EBookTag = sequelize.models.EBookTag;
    }

    /**
     * 
     * @param {*} includeEBookTag 是否包含被EBook引用的数据
     * @param {*} onlyWithBook 是否仅要含书本引用的信息
     * @returns 
     */
    async findAll(includeEBookTag = false, onlyWithBook = false) {
        const include = includeEBookTag ? [{
            model: this.#EBookTag,
            required: onlyWithBook,  // true → INNER JOIN, false → LEFT JOIN
        }] : [];
        return await this.#TagModel.findAll({ include });
    }

    getModel() {
        return this.#TagModel;
    }
}
