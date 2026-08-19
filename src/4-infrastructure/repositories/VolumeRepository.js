import { Op } from "sequelize";
export class VolumeRepository {
    #VolumeModel;

    constructor(sequelize) {
        this.#VolumeModel = sequelize.models.Volume;
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
}