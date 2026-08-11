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
    return await this.#ebookRepository.findAll();
  }


}
