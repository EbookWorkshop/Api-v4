import { WebBookQueryService } from "../../../2-application/services/WebBookQueryService.js";
import { WebBookDetailQueryService } from "../../../2-application/services/WebBookDetailQueryService.js";

export class WebBookController {
  #webBookQueryService;
  #webBookCommandService;
  #webBookDetailQuery;

  /**
   * 
   * @param {WebBookQueryService} bookQueryService 
   * @param {*} bookCommandService 
   * @param {WebBookDetailQueryService} bookDetailQuery 
   */
  constructor(bookQueryService, bookCommandService, bookDetailQuery) {
    this.#webBookQueryService = bookQueryService;
    this.#webBookCommandService = bookCommandService;
    this.#webBookDetailQuery = bookDetailQuery;
  }

  async listBooks(ctx) {
    ctx.body = await this.#webBookQueryService.getBookList();
  }

  async queryBook(ctx) {
    const bookId = ctx.query.bookid * 1;
    ctx.body = await this.#webBookDetailQuery.getBookDetail(bookId);
  }



}
