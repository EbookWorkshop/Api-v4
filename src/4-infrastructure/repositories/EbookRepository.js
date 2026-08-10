export class EbookRepository {
  #EbookModel;

  constructor(sequelize) {
    this.#EbookModel = sequelize.models.Ebook;
  }

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
