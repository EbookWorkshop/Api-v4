import { Op } from "sequelize";
import { IntroductionName } from '../../3-domain/constants/BookConstants.js';
export class ChapterRepository {
    #ChapterModel;
    #EbookModel;

    constructor(sequelize) {
        this.#ChapterModel = sequelize.models.EbookChapter;
        this.#EbookModel = sequelize.models.Ebook;
    }

    /**
     * 找到具体章节
     * @param {*} chapterId 
     * @returns 
     */
    async findByPK(chapterId) {
        return await this.#ChapterModel.findByPk(chapterId, {
            include: [{ model: this.#EbookModel, as: "Ebook" }],
            attributes: { include: [["id", "IndexId"]], exclude: ["id"] }
        });
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
}