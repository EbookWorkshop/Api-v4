import { Op } from "sequelize";
export class WebBookChapterRepository {
    #WebBookChapterModel;
    #ChapterModel;
    #WebBookChapterURLModel;
    #WebBookModel;
    #EbookModel;
    #sequelize;

    constructor(sequelize) {
        this.#WebBookChapterModel = sequelize.models.WebBookChapter;
        this.#ChapterModel = sequelize.models.EbookChapter;
        this.#WebBookChapterURLModel = sequelize.models.WebBookChapterURL;
        this.#WebBookModel = sequelize.models.WebBook;
        this.#EbookModel = sequelize.models.Ebook;
        this.#sequelize = sequelize;
    }

    async addChapter(chapter, option) {
        return this.#WebBookChapterModel.create(chapter, option);
    }

    /**
     * 批量插入章节
     * @param {object} option
     * @param {Array<{WebTitle:string,IndexId:number}>} option.chapters 章节列表
     * @param {Object} setting
     */
    async batchInsertChapters({ chapters }, { transaction } = {}) {
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

    /**
     * 
     * @param {*} bookId 
     * @param {{ transaction?: import('sequelize').Transaction }} [options]
     * @returns 
     */
    async findIdOrderByBookId(bookId, { transaction } = {}) {
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
     * 
     * @param {number} bookId 
     * @returns {Promise<Array<{title:string,ruls:Array<string>}>>}
     */
    async findChapterWithURL(bookId) {
        let result = await this.#ChapterModel.findAll({
            where: { BookId: bookId },
            include: [{
                model: this.#WebBookChapterModel, as: "WebBookChapter",
                include: [{
                    model: this.#WebBookChapterURLModel,
                    attributes: ["Path"]
                }]
            }]
        });
        return result.map(({ Title, WebBookChapter }) => {
            return { title: Title, webTitle: WebBookChapter?.WebTitle ?? Title, urls: WebBookChapter?.WebBookChapterURLs?.map(url => url.Path) || [] }
        })
    }

    /**
     * 找到最新一个空章节
     * @returns 
     */
    async findLatestEmpty() {
        const chap = await this.#ChapterModel.findOne({
            include: [{
                model: this.#EbookModel,
                as: "Ebook",
                required: true,
                attributes: ["BookName"],
                include: [{
                    model: this.#WebBookModel,
                    as: "WebBook",
                    required: true,
                    where: { AutoSyncEnabled: { [Op.eq]: true } },
                    attributes: [],
                }],
            }],
            where: {
                Content: { [Op.is]: null },
                OrderNum: { [Op.gt]: 0 },
            },
            attributes: ["id", "BookId", "Title"],
            order: [[this.#sequelize.col("EbookChapter.updatedAt"), "DESC"]],
            raw: true,
        });

        if (!chap) {
            const [rows] = await this.#ChapterModel.update(
                { Content: null },
                { where: { Content: { [Op.eq]: "" } } }
            );
            console.log("所有待办任务已处理，已重置任务数：", rows);
            return { id: null };
        }

        const { BookId, id, Title, "Ebook.BookName": BookName } = chap;
        return { BookId, id, Title, BookName };
    }
}