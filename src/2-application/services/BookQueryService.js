import { EbookRepository } from '../../4-infrastructure/repositories/EbookRepository.js';

export class BookQueryService {
  /** @type {EbookRepository} */
  #ebookRepository;

  /**
   * @param {EbookRepository} ebookRepository 
   */
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
