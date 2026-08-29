import Sequelize, { Op } from "sequelize";
export class RuleForWebRepository {
    #RuleForWebModel;
    #sequelize;

    constructor(sequelize) {
        this.#RuleForWebModel = sequelize.models.RuleForWeb;
        this.#sequelize = sequelize;
    }

    /**
     * 获取站点列表
     * @returns 
     */
    async listHosts() {
        const hosts = await this.#RuleForWebModel.findAll({
            attributes: [[Sequelize.fn('DISTINCT', Sequelize.col('Host')), 'Host']],
            order: [["updatedAt", "DESC"]],
            raw: true
        });
        return hosts.map(item => item.Host);
    }

    async finByHost(host) {
        let rules = await this.#RuleForWebModel.findAll({
            where: { Host: host },
            raw: true,
        });

        return rules;
    }

    /**
     * 查找站点的使用情况
     */
    async findHostUsing(host) {
        // const rows = await this.#WebBookIndexSourceURL.findAll({
        //     where: { Path: { [Models.Op.like]: `%${host}%` } },
        //     include: [{
        //         model: this.#WebBook,
        //         attributes: ['BookId'],
        //         include: [{ model: this.#Ebook, attributes: ['id', 'BookName'] }]
        //     }],
        //     attributes: [
        //         'WebBookId',
        //         [this.#sequelize.literal(
        //             `(SELECT MAX("createdAt") FROM [WebBookIndexSourceURLs] s WHERE s."Path" LIKE '%${host}%')`
        //         ), 'MaxCreatedAt']
        //     ],
        //     raw: true
        // });

        const data = this.#sequelize.query(`
        SELECT
            wbi.[WebBookId],
            wb.[BookId] AS [WebBook.BookId],
            eb.[id] AS [WebBook.Ebook.id],
            eb.[BookName] AS [WebBook.Ebook.BookName],
            (
                SELECT MAX(s.[createdAt])
                FROM [WebBookIndexSourceURLs] s
                WHERE s.[Path] LIKE :host
            ) AS [MaxCreatedAt]
        FROM [WebBookIndexSourceURLs] wbi
        LEFT JOIN [WebBooks] wb ON wb.[id] = wbi.[WebBookId]
        LEFT JOIN [Ebooks] eb ON eb.[id] = wb.[BookId]
        WHERE wbi.[Path] LIKE :host`, {
            replacements: { host:`%${host}%` },
            type: this.#sequelize.QueryTypes.SELECT
        });
        return data;
    }

}