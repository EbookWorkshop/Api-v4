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
    ctx.body = await this.#bookQueryService.getBookList();
  }

  async queryBook(ctx) {
    const bookId = ctx.query.bookid * 1;
    ctx.body = await this.#bookDetailQuery.getBookDetail(bookId);
  }

  /**
   * @swagger
   * /api/books:
   *   post:
   *     summary: 创建新书
   *     tags: [Books]
   *     requestBody:
   *       required: true
   *       content:
   *         application/json:
   *           schema:
   *             type: object
   *             properties:
   *               bookName:
   *                 type: string
   *               author:
   *                 type: string
   *     responses:
   *       201:
   *         description: 创建成功
   */
  async createBook(ctx) {
    const newBook = await this.#bookCommandService.createBook(ctx.request.body);
    ctx.status = 201;
    ctx.body = newBook;
  }

  // 命令：更新热度
  async updateHotness(ctx) {
    const { id } = ctx.params;
    const { hotness } = ctx.request.body;
    const result = await this.#bookCommandService.updateHotness(parseInt(id, 10), hotness);
    ctx.body = result;
  }
}
