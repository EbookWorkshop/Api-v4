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
     * 
     * @param {number} bookId 
     * @returns {Array<{title:string,ruls:Array<string>}>}
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
}