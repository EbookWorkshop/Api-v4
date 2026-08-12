import { WebBookRepository } from '../../4-infrastructure/repositories/WebBookRepository.js';

export class WebBookQueryService {
  /** @type {WebBookRepository} */
  #webBookRepository;

  /**
   * @param {WebBookRepository} webBookRepository 
   */
  constructor(webBookRepository) {
    this.#webBookRepository = webBookRepository;
  }

  async getBookList() {
    return await this.#webBookRepository.findAll();
  }


}
