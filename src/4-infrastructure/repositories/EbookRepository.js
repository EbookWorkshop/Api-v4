import { Op } from "sequelize";
export class EbookRepository {
  #EbookModel;

  constructor(sequelize) {
    this.#EbookModel = sequelize.models.Ebook;
  }

  /**
   * 找到所有书本
   * @param {*} orderBy 排序设置，默认按热度倒序
   * @returns  JSON 格式的书籍列表
   */
  async findAll(orderBy = [['Hotness', 'DESC']]) {
    return await this.#EbookModel.findAll({ order: orderBy, attributes: { include: [["id", "BookId"]] }, raw: true });
  }

  /**
   * 找到具体的书
   * @param {*} bookId 书籍ID
   * @returns JSON 格式的书籍信息
   */
  async findById(bookId) {
    return await this.#EbookModel.findByPk(bookId, { raw: true });
  }


  // async create(data) {
  //   return await this.#EbookModel.create(data);
  // }

  // async bulkCreate(books) {
  //   return await this.#EbookModel.bulkCreate(books);
  // }

  getModel() {
    return this.#EbookModel;
  }
}
