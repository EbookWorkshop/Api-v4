import { Op } from "sequelize";
import { IntroductionName } from '../../3-domain/constants/BookConstants.js';
export class ChapterRepository {
    #ChapterModel;

    constructor(sequelize) {
        this.#ChapterModel = sequelize.models.EbookChapter;
    }

    async findAll(bookId) {
        return
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