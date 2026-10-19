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

    async search({ text, type, host }) {
        const where = [], param = [];
        const searchText = text.split(" ");
        if (host) where.push({ host: { [Op.eq]: host } });
        if (type == "书名" || type == "不限") for (const st of searchText) param.push({ BookName: { [Op.like]: `%${st}%` } });
        if (type == "作者" || type == "不限") for (const st of searchText) param.push({ Author: { [Op.like]: `%${st}%` } });

        if (type == "不限" || param.length > 1) where.push({ [Op.or]: param });
        else where.push(...param);

        const books = await this.#StorageModel.findAll({
            where: { [Op.and]: where },
            order: [["BookName", "ASC"]],
        });
        const result = books.map(book => book.toJSON());

        for (const b of books) {//搜索命中的条目通过更新CoverImage为‘’实现排队优先
            if (b.CoverImage || b.CoverImage === '' || b.CoverImage === 'pending') continue;
            b.CoverImage = '';
            b.save();
        }
        return result;
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
            order: [["CoverImage", "DESC"], ['id', 'ASC']],//搜索命中的条目通过更新CoverImage为‘’实现排队优先
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

    /**
     * 找出需要做封面本地化缓存的记录
     *
     * 命中条件：
     *   - CoverImage 非空
     *   - CoverImage 不以 http 开头
     *   - CoverImage 不以 Cache/ 开头（避免二次处理）
     *   - CoverImage 在全表出现次数 <= threshold（超过则跳过，用户要求 > 3 跳过）
     *
     * @param {number} [threshold=3]
     * @returns {Promise<Object|null>} { id, BookName, Source, Host, CoverImage }
     */
    async findOneNeedingCoverCache(threshold = 3) {
        // 1. 取候选（限定数量，避免一次拉太多）
        const freqCover = await this.findFrequentCovers(threshold);
        const candidates = await this.#StorageModel.findAll({
            where: {
                CoverImage: {
                    [Op.and]: [
                        { [Op.like]: 'http%' },
                        { [Op.notIn]: freqCover },
                        { [Op.notLike]: '%#check' },
                    ]
                }
            },
            attributes: ['id', 'BookName', 'Source', 'Host', 'CoverImage'],
            order: [['Show', 'DESC'], ["id", "DESC"]],
            limit: 1,
            raw: true,
        });

        if (candidates.length === 0) return null;

        // 2. 统计候选封面在表中的出现次数
        const uniqueCovers = [...new Set(candidates.map(r => r.CoverImage))];
        const freqRows = await this.#StorageModel.findAll({
            attributes: [
                'CoverImage',
                [this.#sequelize.fn('COUNT', this.#sequelize.col('CoverImage')), 'Count'],
            ],
            where: { CoverImage: { [Op.in]: uniqueCovers } },
            group: ['CoverImage'],
            raw: true,
        });
        const freqMap = new Map(freqRows.map(r => [r.CoverImage, Number(r.Count)]));

        // 3. 返回第一条频率不超过阈值的记录
        for (const row of candidates) {
            if ((freqMap.get(row.CoverImage) || 0) <= threshold) return row;
        }
        return null;
    }

    async listStorageStep() {
        return this.#StorageStepModel.findAll({
            order: [["updatedAt", "ASC"]]
        });
    }

    /**
     * 按 Host 汇总库存统计：
     * - Total   该 Host 下记录总数
     * - Cached  CoverImage 以 "Cache%" 开头的记录数（已本地化缓存）
     * - Missing CoverImage 为 NULL 或空串的记录数（待抓封面）
     * - Online CoverImage 为 "http" 开头但不含重复3次以上的数据
     * @returns {Promise<Array<{Host:string,Total:number,Cached:number,Missing:number,CacheRate:number}>>}
     */
    async getHostStats() {
        const sequelize = this.#sequelize;
        const excludeCovers = await this.findFrequentCovers(3);

        const covers = Array.isArray(excludeCovers) ? excludeCovers.filter(Boolean) : [];
        const onlineCase = covers.length > 0
            ? `CASE WHEN CoverImage LIKE 'http%' AND CoverImage NOT LIKE '%#check' AND CoverImage NOT IN (:excludeCovers) THEN 1 ELSE 0 END`
            : `CASE WHEN CoverImage LIKE 'http%' AND CoverImage NOT LIKE '%#check' THEN 1 ELSE 0 END`;
        const rows = await this.#StorageModel.findAll({
            attributes: [
                'Host',
                [sequelize.fn('COUNT', sequelize.col('*')), 'Total'],
                [
                    sequelize.fn(
                        'SUM',
                        sequelize.literal(
                            `CASE WHEN CoverImage LIKE 'Cache%' THEN 1 ELSE 0 END`
                        )
                    ),
                    'Cached',
                ],
                [
                    sequelize.fn('SUM', sequelize.literal(onlineCase)),
                    'Online',
                ],
                [
                    sequelize.fn(
                        'SUM',
                        sequelize.literal(
                            `CASE WHEN CoverImage IS NULL OR CoverImage = '' THEN 1 ELSE 0 END`
                        )
                    ),
                    'Missing',
                ],
            ],
            group: ['Host'],
            order: [[sequelize.literal('Total'), 'DESC']],
            replacements: covers.length > 0 ? { excludeCovers: covers } : {},
            raw: true,
        });

        return rows.map((r) => {
            const Total = Number(r.Total) || 0;
            const Cached = Number(r.Cached) || 0;
            const Missing = Number(r.Missing) || 0;
            const Online = Number(r.Online) || 0;
            return {
                Host: r.Host,
                Total,
                Cached,
                Missing,
                Online,
                CacheRate: Total > 0 ? Number(((Cached / Total) * 100).toFixed(2)) : 0,
            };
        });
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
        const run = async (batch, trans) => {
            await this.#StorageModel.bulkCreate(batch, {
                transaction: trans,
                ignoreDuplicates: true,//遇到重复数据跳过插入
            });
            return true;
        };
        const BATCH_SIZE = 500;
        for (let i = 0; i < books.length; i += BATCH_SIZE) {
            const batch = books.slice(i, i + BATCH_SIZE);

            if (transaction) await run(batch, transaction);
            else await sequelize.transaction((trans) => run(batch, trans));
        }

    }

    /**
     * 更新指定 Storage 记录的封面
     * @param {number} id
     * @param {string} coverImage
     */
    async updateCover(id, coverImage) {
        return this.#StorageModel.update(
            { CoverImage: coverImage, Show: 0 },//NOTE: Show 为开发中临时特性
            { where: { id } }
        );
    }

    async restartCover() {
        return this.#StorageModel.update({ CoverImage: null }, {
            where: { CoverImage: { [Op.eq]: "pending" } }
        });
    }
}