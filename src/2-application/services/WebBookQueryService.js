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
    const bl = await this.#webBookRepository.findAll();
    return bl.map(({ Ebook, ...b }) => ({
      ...Ebook, ...b
    }));
  }


}
