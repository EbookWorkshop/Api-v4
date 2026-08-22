import { Op } from "sequelize";
import { AppError, UserInputError } from "../../5-shared/errors/index.js";
export class VolumeRepository {
    #VolumeModel;
    #ChapterModel;
    #sequelize;

    constructor(sequelize) {
        this.#VolumeModel = sequelize.models.Volume;
        this.#ChapterModel = sequelize.models.EbookChapter;
        this.#sequelize = sequelize;
    }

    async findByBookId(bookId) {
        return await this.#VolumeModel.findAll({
            where: {
                BookId: { [Op.eq]: bookId }
            },
            attributes: {
                include: [["id", "VolumeId"]],
                exclude: ["id", "createdAt", "updatedAt"]
            }
            , raw: true
        })
    }


    /**
     * 创建一个新卷
     * @param {Number} bookId 
     * @param {String} title 
     * @param {String?} introduction 
     */
    async createVolume(bookId, title, introduction) {
        const [newid, rows] = await this.#VolumeModel.sequelize.query(
            `INSERT INTO Volumes (BookId, Title, Introduction, OrderNum, createdAt, updatedAt) 
                SELECT :bookId, :title, :introduction, COALESCE(MAX(OrderNum), 0) + 1, datetime('now'), datetime('now')
                FROM Volumes 
                WHERE BookId = :bookId`,
            {
                replacements: { bookId, title, introduction },
                type: this.#VolumeModel.sequelize.QueryTypes.INSERT
            }
        );
        return {
            VolumeId: newid,
            BookId: bookId,
            Title: title,
            Introduction: introduction,
            // OrderNum: 99999,
        }
    }

    /**
     * 更新一个新卷
     * @param {Number} volumeId 
     * @param {String} title 
     * @param {String?} introduction 
     */
    async updateVolume({ volumeId, title, introduction }) {
        const volume = await this.#VolumeModel.findByPk(volumeId);
        if (!volume) throw new AppError("未找到该分卷", 404);
        if (title) volume.Title = title;
        if (introduction) volume.Introduction = introduction;
        await volume.save();
        return true;
    }

    /**
     * 删除一个卷
     * # 并释放卷中所有章节
     * @param {number} volumeId 
     * @returns 
     */
    async deleteVolume(volumeId) {
        const trans = await this.#sequelize.transaction();
        //先移出所有章节
        await this.#ChapterModel.update({
            VolumeId: null
        }, {
            where: { VolumeId: volumeId },
            transaction: trans
        });

        //删除卷本身
        const result = await this.#VolumeModel.destroy({
            where: { id: volumeId },
            transaction: trans
        });

        await trans.commit();
        return result;
    }
}