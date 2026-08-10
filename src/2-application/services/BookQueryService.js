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
      BookId: model.id,
      ...model.dataValues
    }));
  }

  async getBook(bookId) {
    const bookModel = await this.#ebookRepository.findById(bookId, false);
    const { EbookChapter, id, ...tempBook } = bookModel.dataValues;
    const introduction = await this.#ebookRepository.findIntroduction(bookId);

    return {
      BookId: id,
      Index: EbookChapter,
      Introduction: introduction?.Content,
      ...tempBook
    };
  }
}
