export class BookQueryService {
  #ebookRepository;

  constructor(ebookRepository) {
    this.#ebookRepository = ebookRepository;
  }

  async getBookList() {
    const models = await this.#ebookRepository.findAll();
    return models.map((model) => ({
      ...model.dataValues
    }));
  }
}
