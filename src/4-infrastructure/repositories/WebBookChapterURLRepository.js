import { Op } from "sequelize";
export class WebBookChapterURLRepository {
    #WebBookChapterURLModel;
    #sequelize;

    constructor(sequelize) {
        this.#WebBookChapterURLModel = sequelize.models.WebBookChapterURL;
        this.#sequelize = sequelize;
    }

    /**
     * 将记录的地址从a改到b
     * @param {*} from 
     * @param {*} to 
     */
    async changeHosts(from, to, { transaction }) {
        return await this.#sequelize.query(`
            update [WebBookChapterURLs] 
            SET Path = REPLACE(Path, :from, :to);`, {
            replacements: { from, to },
            transaction
        })
    }
}