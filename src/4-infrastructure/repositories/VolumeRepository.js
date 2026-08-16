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
}