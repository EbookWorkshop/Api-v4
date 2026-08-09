export class BookController {
  #bookQueryService;

  constructor(bookQueryService) {
    this.#bookQueryService = bookQueryService;
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
   *       500:
   *         description: 服务器错误
   */
  async listBooks(ctx) {
    try {
      const books = await this.#bookQueryService.getBookList();
      ctx.body = {
        success: true,
        data: books,
        total: books.length,
      };
    } catch (error) {
      ctx.status = error.statusCode || 500;
      ctx.body = {
        success: false,
        message: error.message,
      };
    }
  }
}
