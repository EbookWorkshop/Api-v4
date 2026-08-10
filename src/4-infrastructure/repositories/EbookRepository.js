export class EbookRepository {
  #EbookModel;

  constructor(sequelize) {
    this.#EbookModel = sequelize.models.Ebook;
  }

  /**
   * 找到所有书本
   * @param {*} orderBy 排序设置，默认按热度倒序
   * @returns 
   */
  async findAll(orderBy = [['Hotness', 'DESC']]) {
    return await this.#EbookModel.findAll({ order: orderBy });
  }

  async findById(id) {
    return await this.#EbookModel.findByPk(id);
  }

  async create(data) {
    return await this.#EbookModel.create(data);
  }

  async bulkCreate(books) {
    return await this.#EbookModel.bulkCreate(books);
  }

  getModel() {
    return this.#EbookModel;
  }
}
