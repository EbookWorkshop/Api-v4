import { Op } from "sequelize";
export class IndexRepository {
    #IndexModel;

    constructor(sequelize) {
        this.#IndexModel = sequelize.models.EbookChapter.scope('withHasContent');
    }

    /**
     * 找到某书所有的章节名：获取目录
     * @param {*}bookId 
     * @returns 
     */
    async findByBookId(bookId, order = [['OrderNum', 'ASC']]) {
        const attr = ["createdAt", "updatedAt", "id", "Content"];
        const scopeAttrs = this.#IndexModel.options.scopes.withHasContent.attributes.include;
        return this.#IndexModel.findAll({
            attributes: {
                include: [...scopeAttrs, ["id", "IndexId"]] || [],
                exclude: attr
            },
            where: {
                BookId: { [Op.eq]: bookId },
                OrderNum: { [Op.gt]: 0 }
            },
            order: order
        });
    }
}