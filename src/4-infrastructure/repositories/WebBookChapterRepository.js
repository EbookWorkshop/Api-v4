import { Op } from "sequelize";
export class WebBookChapterRepository {
    #WebBookChapterModel;
    #ChapterModel;

    constructor(sequelize) {
        this.#WebBookChapterModel = sequelize.models.WebBookChapter;
        this.#ChapterModel = sequelize.models.EbookChapter;
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
}