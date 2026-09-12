import { Op } from "sequelize";
import { AppError } from "../../5-shared/errors/index.js";
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
     * @param {object} book 
     * @param {number} book.bookId 
     * @param {string} book.title 
     * @param {string?} book.introduction 
     */
    async createVolume({ bookId, title, introduction }) {
        const [newid, _] = await this.#VolumeModel.sequelize.query(
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
     * @param {object} volume
     * @param {number} volume.volumeId 
     * @param {string} volume.title 
     * @param {string?} volume.introduction 
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
     * 更新卷顺序
     * @param {*} volumeOrders 
     */
    async reorderVolumes(volumeOrders) {
        return this.#sequelize.transaction(async (transaction) => {
            for (const v of volumeOrders) {
                await this.#VolumeModel.update(
                    { OrderNum: v.orderNum },
                    { where: { id: v.volumeId }, transaction }
                );
            }
            return true;
        });
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