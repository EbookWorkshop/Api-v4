import { AppError } from '../../../5-shared/errors/AppError.js';

import { BookQueryService } from "../../../2-application/services/BookQueryService.js";
import { BookDetailQueryService } from "../../../2-application/services/BookDetailQueryService.js";

export class BookController {
  #bookQueryService;
  #bookCommandService;
  #bookDetailQuery;

  /**
   * 
   * @param {BookQueryService} bookQueryService 
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
   * /library/booklist:
   *   get:
   *     summary: 获取图书列表
   *     description: 支持按标签筛选、排除标签，返回统一包装的图书列表
   *     tags:
   *       - Library —— 图书馆
   *       - Book
   *     parameters:
   *       - $ref: '#/components/parameters/TagIdQuery'
   *       - $ref: '#/components/parameters/NotTagQuery'
   *     responses:
   *       200:
   *         description: 成功返回图书列表（统一包装格式）
   *         content:
   *           application/json:
   *             schema:
   *               $ref: '#/components/schemas/BookListResponse'
   *             examples:
   *               success:
   *                 $ref: '#/components/examples/BookListSuccess'
   *               empty:
   *                 $ref: '#/components/examples/BookListEmpty'
   *       600:
   *         description: 参数格式错误（例如 nottag 包含非数字）
   *         content:
   *           application/json:
   *             schema:
   *               $ref: '#/components/schemas/ApiErrorResponse'
   *             example:
   *               code: 60000
   *               msg: "排除标签必须为正整数，多个排除标签可用英文逗号隔开。"
   *       500:
   *         description: 服务器内部错误
   *         content:
   *           application/json:
   *             schema:
   *               $ref: '#/components/schemas/ApiErrorResponse'
   *             example:
   *               code: 50000
   */
  async listBooks(ctx) {
    const tagid = ctx.query.tagid * 1;
    let nottag = ctx.query.nottag;
    if (nottag) {
      nottag = nottag.split(",").map(t => parseInt(t));
      if (nottag.some(t => isNaN(t))) throw new AppError("排除标签必须为正整数，多个排除标签可用英文逗号隔开。", 600);
    }
    ctx.body = await this.#bookQueryService.getBookList(tagid, nottag);
  }

  async queryBook(ctx) {
    const bookId = ctx.query.bookid * 1;
    ctx.body = await this.#bookDetailQuery.getBookDetail(bookId);
  }

  async getMetadata(ctx) {
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
