import { Op } from "sequelize";
export class WebBookRepository {
    #WebBookModel;
    #EbookModel;

    constructor(sequelize) {
        this.#WebBookModel = sequelize.models.WebBook;
        this.#EbookModel = sequelize.models.Ebook;
    }

    /**
     * 找到所有网文
     * @param {*} orderBy 排序设置，默认按热度倒序
     * @returns  JSON 格式的书籍列表
     */
    async findAll(orderBy = [['createdAt', 'DESC']]) {
        const bl = await this.#WebBookModel.findAll({
            include: [{
                model: this.#EbookModel,
                as: "Ebook",
                required: true,
                attributes: { include: [["id", "BookId"]] }
            }],
            order: orderBy, attributes: { include: [["id", "WebBookId"]] }
        });
        return bl.map(b => {
            const { Ebook, ...rest } = b.toJSON();
            const { id, defaultIndex, isCheckRepeat, ...allNeedInfo } = { ...Ebook, ...rest };
            return allNeedInfo;
        });
    }

    /**
     * 找到具体的网文
     * @param {*} bookId 书籍ID
     * @returns JSON 格式的书籍信息
     */
    async findByBookId(bookId) {
        const book = await this.#WebBookModel.findOne({
            where: { BookId: { [Op.eq]: bookId } }
        });
        if (!book) return null;
        return book.toJSON();
    }


    /**
     * 创建一本书
     * @param {*} data 
     * @param {Object} setting 
     * @returns 
     */
    async create(data, { transaction }) {
        return await this.#WebBookModel.create(data, { transaction });
    }

    async update(bookId, data) {
        return this.#WebBookModel.update({
            ...data
        }, {
            where: { BookId: bookId }
        })
    }
}
