import { Op } from "sequelize";
import { IntroductionName } from '../../3-domain/constants/BookConstants.js';
import { AppError, UserInputError } from '../../5-shared/errors/index.js';
export class ChapterRepository {
    #ChapterModel;
    #EbookModel;
    #VolumeModel;

    constructor(sequelize) {
        this.#ChapterModel = sequelize.models.EbookChapter;
        this.#EbookModel = sequelize.models.Ebook;
        this.#VolumeModel = sequelize.models.Volume;
    }

    /**
     * 找到具体章节
     * @param {*} chapterId 
     * @returns 
     */
    async findByPK(chapterId) {
        return await this.#ChapterModel.findByPk(chapterId, {
            attributes: { include: [["id", "IndexId"]], exclude: ["id"] }
        });
    }

    /**
     * 找到具体章节信息（含书本信息）
     * @param {*} chapterId 
     * @returns 
     */
    async findByPkWithEbook(chapterId) {
        const chapter = await this.#ChapterModel.findByPk(chapterId, {
            include: [{ model: this.#EbookModel, as: "Ebook" }],
            attributes: { include: [["id", "IndexId"]], exclude: ["id"] },
        });
        if (!chapter) return null;
        return chapter.toJSON();
    }

    /**
      * 读取简介章
      * @param {*}bookId 
      */
    async findIntroduction(bookId) {
        return await this.#ChapterModel.findOne({
            where: {
                BookId: { [Op.eq]: bookId },
                Title: { [Op.eq]: IntroductionName }
            },
            attributes: ["Content"]
        });
    }

    /**
     * 查找上一章
     * @param {number} bookId 书籍ID
     * @param {number} currentOrderNum 当前章节序号
     * @returns {Promise<Model|null>}
     */
    async findPrevious(bookId, currentOrderNum) {
        return await this.#ChapterModel.findOne({
            where: {
                BookId: bookId,
                OrderNum: { [Op.lt]: currentOrderNum }, // 小于当前序号
            },
            order: [['OrderNum', 'DESC']], // 倒序取第一条，即最近的上一章
        });
    }

    /**
     * 查找下一章
     * @param {number} bookId 书籍ID
     * @param {number} currentOrderNum 当前章节序号
     * @returns {Promise<Model|null>}
     */
    async findNext(bookId, currentOrderNum) {
        return await this.#ChapterModel.findOne({
            where: {
                BookId: bookId,
                OrderNum: { [Op.gt]: currentOrderNum }, // 大于当前序号
            },
            order: [['OrderNum', 'ASC']], // 正序取第一条，即最近的下一章
        });
    }

    /**
     * 找到所有隐藏的章节
     * @param {*} bookId 
     * @returns 
     */
    async listHiddenChapters(bookId) {
        return await this.#ChapterModel.findAll({
            where: {
                BookId: bookId,
                OrderNum: { [Op.lt]: 0 }
            },
            attributes: ["Title", ["id", "IndexId"]],
            raw: true
        });
    }

    /**
     * 搜索章节内容
     * @param {String} keyword 查询关键字
     * @param {Object} [option] - 可选参数（允许为空）
     * @param {("title"|"content")} [option.type] - 搜索类型，`title` 或 `content`
     * @param {number[]} [option.bookId] - 仅查询范围的书籍 ID 数组，允许为空
     * @param {number[]} [option.notFind] - 排除的书籍 ID 数组，允许为空
     * @returns 
     */
    async searchChapters(keyword, option = {}) {
        const { sequelize } = this.#ChapterModel;
        const condition = [];
        if (option?.type === "title") condition.push({ Title: { [Op.like]: `%${keyword}%` } })
        else if (option?.type === "content") condition.push({ Content: { [Op.like]: `%${keyword}%` } })
        else condition.push({
            [Op.or]: [{ Title: { [Op.like]: `%${keyword}%` } }, { Content: { [Op.like]: `%${keyword}%` } }]
        });

        if (option.bookId?.length > 0) condition.push({ [Op.and]: { BookId: { [Op.in]: option.bookId } } });
        if (option.notFind?.length > 0) condition.push({ [Op.and]: { BookId: { [Op.notIn]: option.notFind } } });

        //构建计算字段 原理：(原字符串长度 - 替换掉所有关键字后的长度) ÷ 关键字的长度
        const hitCountLiteral = sequelize.literal(` (LENGTH(Content) - LENGTH(REPLACE(Content, ${sequelize.escape(keyword)}, ''))) / LENGTH(${sequelize.escape(keyword)}) `);

        const results = await this.#ChapterModel.findAll({
            where: condition,
            attributes: {
                include: ["id", "Title", "BookId", "Content",
                    [hitCountLiteral, 'HitCount']  // 直接算出 HitCount
                ],
            },
            include: [{
                model: this.#EbookModel, as: "Ebook",
                attributes: ["BookName"]
            }, {
                model: this.#VolumeModel, as: "Volume",
                attributes: ["Title"],
            }],
            order: [[sequelize.literal('HitCount'), 'DESC']], // 按命中次数倒序
            limit: 500,            // 加上 limit，避免数据量过大
        });

        if (!results) return [];
        return results.map((chapModel) => {
            const { Ebook, Volume, ...rest } = chapModel.toJSON();
            return {
                BookName: Ebook?.BookName,
                VolumeTitle: Volume?.Title,
                ...rest
            }
        });
    }

    /**
     * 从卷中移除指定章节
     * @param {number[]} chapterIds 
     * @returns 
     */
    async removeChaptersFromVolume(chapterIds) {
        const [result] = await this.#ChapterModel.update(
            { VolumeId: null },
            { where: { id: { [Op.in]: chapterIds } } }
        );

        return result;
    }

    /**
     * 批量移入章节到卷中
     * @param {*} volumeId 
     * @param {*} chapterIds 
     * @returns 
     */
    async moveChaptersToVolume(volumeId, chapterIds) {
        const [result] = await this.#ChapterModel.update(
            { VolumeId: volumeId },
            { where: { id: { [Op.in]: chapterIds } } }
        );

        return result;
    }


    /**
     * 插入或更新一章
     * @param {Object} [chapter] 章节信息
     * @param {number} [chapter.IndexId] 章节ID
     * @param {number} [chapter.BookId] 书籍ID
     * @param {string} [chapter.Title] 章节标题     
     * @param {string} [chapter.Content] 章节正文
     * @param {number} [chapter.VolumeId] 卷ID
     * @param {number} [chapter.OrderNum] 章节排序号
     */
    async upsertChapter(chapter) {
        //校验卷需要属于同一本书
        if (chapter.VolumeId) {
            const volume = await this.#VolumeModel.findByPk(chapter.VolumeId);
            if (!volume || volume.BookId != chapter.BookId) throw new UserInputError("设置的卷不存在或不属于当前书籍，请选择同一本书内的卷。");
        }
        const result = await this.#ChapterModel.upsert(chapter);
        return !!result;
    }

    /**
     * 根据ID删除章节
     * @param {*} chapterId 需要删除的章节
     * @returns 
     */
    async deleteChapter(chapterId) {
        return await this.#ChapterModel.destroy({ where: { id: chapterId } });
    }

    /**
     * 批量插入章节
     * @param {number} bookId 将插入的书籍
     * @param {number|undefined} volumeId 插到指定卷中，-1为不设置卷
     * @param {Array<{Content:string,OrderNum:number,Title:string}>} chapters 章节列表
     * @param {Object} setting
     */
    async batchInsertChapters({ bookId, volumeId, chapters }, { transaction }) {
        const { sequelize } = this.#ChapterModel;
        const trans = transaction ? transaction : await sequelize.transaction();

        let maxOrderNum = await this.#ChapterModel.max('OrderNum', {
            where: { BookId: bookId }
        }) || 1;
        if (volumeId == -1) volumeId = null;
        else if (volumeId) {
            const volume = await this.#VolumeModel.findByPk(volumeId);
            if (!volume) throw new UserInputError("待导入的卷并不存在，ID：" + volumeId);
            if (bookId != volume.BookId) throw new UserInputError("导入数据错误：导入的书本与选定导入的卷不在同一本书中。");
        }

        let order = maxOrderNum + 1;
        const processedChapters = chapters.map(({ VolumeId, ...cp }) => ({
            ...cp,
            OrderNum: cp.OrderNum ? (cp.OrderNum + order++) : order++,
            BookId: bookId,
            VolumeId: (volumeId || VolumeId || null)
        }));

        //分批插入 避免生成的 SQL 超出 SQLite 的 SQL 长度限制（默认约 1e6 字符）
        const BATCH_SIZE = 500;
        for (let i = 0; i < processedChapters.length; i += BATCH_SIZE) {
            const batch = processedChapters.slice(i, i + BATCH_SIZE);
            await this.#ChapterModel.bulkCreate(batch, { transaction: trans });
        }

        if (!transaction) await trans.commit();
        return true;
    }

    /**
     * 批量更新章节顺序
     * @param {Object} [orderData] 新的排序配置
     * @param {Object} [orderData.indexId] 待更新的章节ID
     * @param {Object} [orderData.newOrder] 要更新到的新序号
     * @returns 
     */
    async updateOrder(orderData) {
        // 构建 CASE WHEN 的 SQL
        // 避免循环执行而产生大量的数据库连接/网络往返消耗
        let caseSql = '';
        const replacements = [];//参数数组
        // const ids = [];
        orderData.forEach(({ indexId, newOrder }) => {
            caseSql += ` WHEN ? THEN ?`;        //使用占位符
            replacements.push(indexId, newOrder);
        });

        const inPlaceholders = (new Array(orderData.length)).fill("?").join(',');//生成与id数相同的占位符字符串
        const ids = orderData.map(item => item.indexId);
        replacements.push(...ids);   // 将 ids 追加到参数数组末尾

        const sql = `UPDATE "EbookChapters"
        SET "OrderNum" = CASE "id"
            ${caseSql}
        END
        WHERE "id" IN (${inPlaceholders})`;
        const [_, rows] = await this.#ChapterModel.sequelize.query(sql, {
            replacements,   // 按顺序替换所有占位符的参数
            type: this.#ChapterModel.sequelize.QueryTypes.UPDATE
        });

        return rows;
    }

    /**
     * 切换是否隐藏章节
     * @param {number} chapterId 章节ID
     * @returns 
     */
    async toggleHide(chapterId) {
        const { sequelize } = this.#ChapterModel
        return this.#ChapterModel.update({
            OrderNum: await sequelize.literal('OrderNum * -1')
        }, {
            where: { id: chapterId }
        });
    }

    /**
     * 将指定章节设置为简介
     * 并将已有的简介章节放出
     * @param {*} chapterId 章节ID
     * @returns 
     */
    async setAsIntroduction(chapterId) {
        const { sequelize } = this.#ChapterModel;
        const trans = await sequelize.transaction();
        const chapter = await this.#ChapterModel.findByPk(chapterId);
        if (!chapter) throw new AppError("待操作的章节不存在。", 404);

        await this.#ChapterModel.update({
            Title: "简介",
            OrderNum: sequelize.literal('ABS(OrderNum)')
        }, {
            where: { Title: IntroductionName, BookId: chapter.BookId },
            transaction: trans,
        });
        await this.#ChapterModel.update({
            Title: IntroductionName,
            OrderNum: sequelize.literal('-ABS(OrderNum)')
        }, {
            where: { id: chapterId },
            transaction: trans,
        });
        return trans.commit();
    }
}