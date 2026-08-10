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

  async getBook(bookid) {
    const bookModel = await this.#ebookRepository.findById(bookid, false);
    const { EbookChapter, id, ...tempBook } = bookModel.dataValues;
    const introduction = await this.#ebookRepository.findIntroduction(bookid);

    return {
      BookId: id,
      Index: EbookChapter,
      Introduction: introduction?.Content,
      ...tempBook
    };
  }
}
