import { BookDetailQueryService } from "../../../2-application/services/BookDetailQueryService.js";
export class WebBookController {
  #webBookQueryService;
  #webBookCommandService;
  #webBookDetailQuery;

  /**
   * 
   * @param {*} bookQueryService 
   * @param {*} bookCommandService 
   * @param {BookDetailQueryService} bookDetailQuery 
   */
  constructor(bookQueryService, bookCommandService, bookDetailQuery) {
    this.#webBookQueryService = bookQueryService;
    this.#webBookCommandService = bookCommandService;
    this.#webBookDetailQuery = bookDetailQuery;
  }

  /**
   * @swagger
   * /api/books:
   *   get:
   *     summary: 获取所有书籍
   *     tags: [Books]
   *     responses:
   *       200:
   *         description: 成功
   *         content:
   *           application/json:
   *             schema:
   *               $ref: '#/components/schemas/BookListResponse'
   */
  async listBooks(ctx) {
    ctx.body = await this.#webBookQueryService.getBookList();
  }

  async queryBook(ctx) {
    const bookId = ctx.query.bookid * 1;
    ctx.body = await this.#webBookDetailQuery.getBookDetail(bookId);
  }



}
