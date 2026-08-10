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




    // const myModels = new Models();
    // let chapter = await myModels.EbookIndex.findOne({
    //     attributes: ["BookId", "OrderNum"],
    //     where: { id: chapterId }
    // });
    // if (chapter == null) return null;

    // let { OrderNum, BookId } = chapter.dataValues;
    // let pre = await myModels.EbookIndex.findOne({
    //     attributes: ["id"],
    //     where: {
    //         bookId: BookId,
    //         OrderNum: {
    //             [Models.Op.and]: [
    //                 { [Models.Op.lt]: OrderNum },
    //                 { [Models.Op.gt]: 0 }
    //             ]
    //         }
    //     },
    //     order: [
    //         ["OrderNum", "DESC"]
    //     ]
    // });
    // let next = await myModels.EbookIndex.findOne({
    //     attributes: ["id"],
    //     where: {
    //         bookId: BookId,
    //         OrderNum: {
    //             [Models.Op.gt]: OrderNum
    //         }
    //     },
    //     order: [
    //         ["OrderNum", "ASC"]
    //     ]
    // });

    // return { pre, next };


}