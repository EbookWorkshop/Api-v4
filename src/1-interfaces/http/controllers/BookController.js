import { BookDetailQueryService } from "../../../2-application/services/BookDetailQueryService.js";
export class BookController {
  #bookQueryService;
  #bookCommandService;
  #bookDetailQuery;

  /**
   * 
   * @param {*} bookQueryService 
   * @param {*} bookCommandService 
   * @param {BookDetailQueryService} bookDetailQuery 
   */
  constructor(bookQueryService, bookCommandService, bookDetailQuery) {
    this.#bookQueryService = bookQueryService;
    this.#bookCommandService = bookCommandService;
    this.#bookDetailQuery = bookDetailQuery;
  }

  async listBooks(ctx) {
    ctx.body = await this.#bookQueryService.getBookList();
  }

  async queryBook(ctx) {
    const bookId = ctx.query.bookid * 1;
    ctx.body = await this.#bookDetailQuery.getBookDetail(bookId);
  }

  async getMetadata(ctx){
    const bookId = ctx.query.bookid * 1;
    ctx.body = await this.#bookDetailQuery.getMetadata(bookId);    
  }


  async createBook(ctx) {
    const newBook = await this.#bookCommandService.createBook(ctx.request.body);
    ctx.status = 201;
    ctx.body = newBook;
  }

  async updateHotness(ctx) {
    const { id } = ctx.params;
    const { hotness } = ctx.request.body;
    const result = await this.#bookCommandService.updateHotness(parseInt(id, 10), hotness);
    ctx.body = result;
  }
}
