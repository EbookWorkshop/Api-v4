import { Op } from "sequelize";
export class WebBookRepository {
    #WebBookModel;
    #EbookModel;
    #EBookTagModel;

    constructor(sequelize) {
        this.#WebBookModel = sequelize.models.WebBook;
        this.#EbookModel = sequelize.models.Ebook;
        this.#EBookTagModel = sequelize.models.EBookTag;
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
     * 找到合适更新目录的书籍
     * @param {object} param 
     * @param {number|Array<number>} [param.tagId] 方式一：通过tag过滤
     * @returns 
     */
    async findOldest(param) {
        const search = {}
        if (param.tagId) {
            const id = Array.isArray(param.tagId) ? param.tagId : [param.tagId]
            search.include = [{
                model: this.#EbookModel,
                as: 'Ebook',
                required: true,
                attributes: { include: [["id", "BookId"]] },
                include: [{
                    model: this.#EBookTagModel,
                    required: true,
                    attributes: [],
                    where: { TagId: id },
                }],
            }]
        }

        const webBook = await this.#WebBookModel.findOne({
            ...search,
            order: [["updatedAt", "ASC"]],
        })

        if (!webBook) return null;
        return webBook.BookId;
    }

    /**
     * 创建一本书
     * @param {*} data 
     * @param {Object} setting 
     * @returns 
     */
    async create(data, { transaction } = {}) {
        return await this.#WebBookModel.create(data, { transaction });
    }

    /**
     * 更新书籍信息
     * @param {*} bookId 
     * @param {*} data 
     * @param {{ transaction?: import('sequelize').Transaction }} [options]
     * @returns 
     */
    async update(bookId, data, { transaction } = {}) {
        return this.#WebBookModel.update({
            ...data
        }, {
            where: { BookId: bookId },
            transaction
        })
    }
}
