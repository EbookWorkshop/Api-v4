import { Op } from "sequelize";
export class WebBookIndexSourceURLRepository {
    #WebBookIndexSourceURLModel;

    constructor(sequelize) {
        this.#WebBookIndexSourceURLModel = sequelize.models.WebBookIndexSourceURL;
    }

    async findByWebBookId(webBookId) {
        return this.#WebBookIndexSourceURLModel.findAll({
            where: {
                WebBookId: webBookId
            },
            raw: true
        })
    }
}