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
            attributes: { include: [["id", "IndexId"]], exclude: ["id"] }
        });
    }

    /**
     * 找到具体章节信息（含书本信息）
     * @param {*} chapterId 
     * @returns 
     */
    async findByPkWithEbook(chapterId) {
        return (await this.#ChapterModel.findByPk(chapterId, {
            include: [{ model: this.#EbookModel, as: "Ebook" }],
            attributes: { include: [["id", "IndexId"]], exclude: ["id"] },
        })).toJSON();
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

}