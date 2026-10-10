import { Op } from "sequelize";
export class StorageRepository {
    #StorageModel;
    #StorageStepModel;
    #sequelize;

    constructor(sequelize) {
        this.#StorageModel = sequelize.models.Storage;
        this.#StorageStepModel = sequelize.models.StorageStep;
        this.#sequelize = sequelize;
    }

    /**
     * 获取指定数量的书籍信息
     * 分页模式：offset 大于-1
     * 随机模式：offset 为-1或缺省
     * @param {Object} options
     * @param {number} [options.host] - 限制来源网站
     * @param {number} [options.author] - 按作者过滤
     * @param {number} [options.limit] - 分页限制
     * @param {number} [options.offset] - 分页偏移，当偏移量为-1时，接口以随机形式返回数据
     * @returns {Promise<Object[]>} 纯对象数组
     */
    async findBookWithPagging(options = {}) {
        const {
            host,
            author,
            limit = 60,//每页数量
            offset = -1,//
        } = options;
        let where = {};
        if (host) where.Host = { [Op.in]: host };
        if (author) where.Author = { [Op.eq]: author };

        const books = await this.#StorageModel.findAll({
            where,
            order: offset >= 0 ? [["id", "ASC"]] : [["Show", "ASC"]],
            limit,
            offset: offset == -1 ? 0 : offset,
        });

        //当不采用偏移量时，直接将当前已查看的数据往后移
        if (offset == -1)
            this.#StorageModel.increment("Show", {
                by: 1,
                where: { id: { [Op.in]: books.map(b => b.id) } },
            });

        return books.map(book => book.toJSON());
    }

    async listHosts() {
        const hosts = await this.#StorageModel.findAll({
            attributes: [[this.#sequelize.fn('DISTINCT', this.#sequelize.col('Host')), 'Host']],
            // order: [["updatedAt", "DESC"]],
            raw: true
        });
        return hosts.map(item => item.Host);
    }

    async findLastPage() {
        const last = this.#StorageStepModel.findOne({
            order: [["updatedAt", "ASC"]],
        });
        return last;
    }

    /**
     * 找出已存在的书源
     * @param {*} source 
     * @returns 
     */
    async findExistSource(source) {
        let result = await this.#StorageModel.findAll({
            where: { Source: { [Op.in]: source } },
            attributes: ["Source"],
            raw: true
        });
        return result.map(r => r.Source);
    }

    /**
     * 取出 CoverImage 为 null / 空串 的一条记录
     * @returns {Promise<Object|null>}
     */
    async findOneMissingCover() {
        return this.#StorageModel.findOne({
            where: {
                [Op.or]: [
                    { CoverImage: null },
                    { CoverImage: '' },
                ],
            },
            order: [['id', 'ASC']],
            raw: true,
        });
    }

    /**
     * 统计 CoverImage 出现次数超过阈值的封面列表
     * @param {number} [threshold=5]
     * @returns {Promise<string[]>}
     */
    async findFrequentCovers(threshold = 5) {
        const rows = await this.#StorageModel.findAll({
            attributes: [
                'CoverImage',
                [this.#sequelize.fn('COUNT', this.#sequelize.col('CoverImage')), 'Count'],
            ],
            where: {
                CoverImage: { [Op.and]: [{ [Op.ne]: null }, { [Op.ne]: '' }] },
            },
            group: ['CoverImage'],
            having: this.#sequelize.literal(`COUNT("CoverImage") > ${Number(threshold)}`),
            raw: true,
        });
        return rows.map(r => r.CoverImage);
    }

    async updateLastPage(page, host) {
        const [lp] = await this.#StorageStepModel.findOrCreate({
            where: { Host: host },
            defaults: {//设置Create时的默认值
                Host: host,
                LastPage: page
            }
        });
        lp.LastPage = page;
        return lp.save();
    }

    async deleteLastPage(host) {
        return this.#StorageStepModel.destroy({ where: { Host: host }, })
    }

    async bulkCreate(books, transaction) {
        const { sequelize } = this.#StorageModel;
        const trans = transaction ? transaction : await sequelize.transaction();

        const processedBooks = books;

        //分批插入
        const BATCH_SIZE = 500;
        for (let i = 0; i < processedBooks.length; i += BATCH_SIZE) {
            const batch = processedBooks.slice(i, i + BATCH_SIZE);
            await this.#StorageModel.bulkCreate(batch, { transaction: trans });
        }
        if (!transaction) await trans.commit();

        return true;
    }

    /**
     * 更新指定 Storage 记录的封面
     * @param {number} id
     * @param {string} coverImage
     */
    async updateCover(id, coverImage) {
        return this.#StorageModel.update(
            { CoverImage: coverImage },
            { where: { id } }
        );
    }
}