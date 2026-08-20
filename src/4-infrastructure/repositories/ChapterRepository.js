import { Op } from "sequelize";
import { IntroductionName } from '../../3-domain/constants/BookConstants.js';
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
     * 搜索章节内容
     * @param {String} keyword 查询关键字
     * @param {Object} [option] - 可选参数（允许为空）
     * @param {("title"|"content")} [option.type] - 搜索类型，`title` 或 `content`
     * @param {number[]} [option.bookId] - 仅查询范围的书籍 ID 数组，允许为空
     * @param {number[]} [option.notFind] - 排除的书籍 ID 数组，允许为空
     * @returns 
     */
    async searchChapters(keyword, option = {}) {
        const condition = [];
        if (option?.type === "title") condition.push({ Title: { [Op.like]: `%${keyword}%` } })
        else if (option?.type === "content") condition.push({ Content: { [Op.like]: `%${keyword}%` } })
        else condition.push({
            [Op.or]: [{ Title: { [Op.like]: `%${keyword}%` } }, { Content: { [Op.like]: `%${keyword}%` } }]
        });

        if (option.bookId?.length > 0) condition.push({ [Op.and]: { BookId: { [Op.in]: option.bookId } } });
        if (option.notFind?.length > 0) condition.push({ [Op.and]: { BookId: { [Op.notIn]: option.notFind } } });

        const result = await this.#ChapterModel.findAll({
            where: condition,
            include: [{
                model: this.#EbookModel, as: "Ebook",
                attributes: ["BookName"]
            }, {
                model: this.#VolumeModel, as: "Volume",
                attributes: ["Title"],
            }],
            attributes: ["id", "Title", "BookId", "Content"]
        });
        if (!result) return [];
        return result.map((chapModel) => {
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
}