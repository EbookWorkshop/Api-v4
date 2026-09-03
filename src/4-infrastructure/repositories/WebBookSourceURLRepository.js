import { Op } from "sequelize";
export class WebBookSourceURLRepository {
    #WebBookSourceURLModel;
    #sequelize;
    #WebBookModel;
    #EbookModel;

    constructor(sequelize) {
        this.#WebBookSourceURLModel = sequelize.models.WebBookSourceURL;
        this.#sequelize = sequelize;
        this.#WebBookModel = sequelize.models.WebBook;
        this.#EbookModel = sequelize.models.Ebook;
    }

    async findByWebBookId(webBookId) {
        return this.#WebBookSourceURLModel.findAll({
            where: {
                WebBookId: webBookId
            },
            raw: true
        })
    }

    async findByHostWithBookInfo(host) {
        return await this.#WebBookSourceURLModel.findAll({
            where: { Path: { [Op.like]: `%${host}%` } },
            include: [{
                model: this.#WebBookModel,
                attributes: ['id', 'BookId'],
                include: [{ model: this.#EbookModel, attributes: ['id', 'BookName'] }]
            }],
            attributes: ["id", "Path"],
            raw: true       //自动将嵌套的关联字段用点号连接起来，形成完整的字段路径
            //即返回的Ebook表id字段自动变成列‘WebBook.Ebook.id’
        });
    }

    /**
     * 将记录的地址从a改到b
     * @param {*} from 
     * @param {*} to 
     */
    async changeHosts(from, to, { transaction }) {
        return await this.#sequelize.query(`
            update [WebBookSourceURLs] 
            SET Path = REPLACE(Path, :from, :to);`, {
            replacements: { from, to },
            transaction
        })
    }
    async add(data, option) {
        return this.#WebBookSourceURLModel.create(data, option);
    }
}