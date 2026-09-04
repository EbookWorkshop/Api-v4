import { Op } from "sequelize";
export class WebBookChapterRepository {
    #WebBookChapterModel;
    #ChapterModel;
    #WebBookChapterURLModel;

    constructor(sequelize) {
        this.#WebBookChapterModel = sequelize.models.WebBookChapter;
        this.#ChapterModel = sequelize.models.EbookChapter;
        this.#WebBookChapterURLModel = sequelize.models.WebBookChapterURL;
    }

    async addChapter(chapter, option) {
        return this.#WebBookChapterModel.create(chapter, option);
    }

    /**
     * 批量插入章节
     * @param {Array<{WebTitle:string,IndexId:number}>} chapters 章节列表
     * @param {Object} setting
     */
    async batchInsertChapters({ chapters }, { transaction }) {
        const { sequelize } = this.#WebBookChapterModel;
        const trans = transaction ? transaction : await sequelize.transaction();

        const processedChapters = chapters;

        //分批插入
        const BATCH_SIZE = 500;
        for (let i = 0; i < processedChapters.length; i += BATCH_SIZE) {
            const batch = processedChapters.slice(i, i + BATCH_SIZE);
            await this.#WebBookChapterModel.bulkCreate(batch, { transaction: trans });
        }
        if (!transaction) await trans.commit();

        return true;
    }

    async findIdOrderByBookId(bookId, { transaction }) {
        return this.#WebBookChapterModel.findAll({
            attributes: ["id", "IndexId"],
            include: [{
                model: this.#ChapterModel, as: 'EbookChapter',
                required: true,
                where: { BookId: bookId },
                attributes: ["OrderNum"],
            }],
            transaction,
            raw: true
        });
    }

    /**
     * 获取章节标题-网址集合
     * @param {*} bookId 
     * @param {*} host 
     * @returns 
     */
    async getWebChapterURL(bookId, host) {
        return await this.#WebBookChapterModel.findAll({
            include: [{
                model: this.#ChapterModel, as: "EbookChapter",
                require: true,
                attributes: [],
                where: { BookId: bookId }
            }, {
                model: this.#WebBookChapterURLModel, as: "WebBookChapterURLs",
                require: true,
                attributes: ["Path"],
                where: { Path: { [Op.like]: `%${host}%` } }//兼容多源的情况
            }],
            attributes: ["WebTitle"],
            raw: true,
        });
    }
}