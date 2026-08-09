export class BookQueryService {
  #ebookRepository;

  constructor(ebookRepository) {
    this.#ebookRepository = ebookRepository;
  }

  async getBookList() {
    const models = await this.#ebookRepository.findAll();
    return models.map((model) => ({
      id: model.id,
      bookName: model.BookName,
      author: model.Author || '佚名',
      hotness: model.Hotness,
      createdAt: model.createdAt,
    }));
  }
}
