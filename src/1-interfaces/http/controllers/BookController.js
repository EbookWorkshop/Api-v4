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

  /**
   * @swagger
   * /library/book:
   *   get:
   *     summary: 获取图书详情
   *     description: 根据图书 ID 返回完整图书信息，包含目录和分卷（统一包装格式）
   *     tags:
   *       - Library —— 图书馆
   *       - Book
   *     parameters:
   *       - $ref: '#/components/parameters/BookIdQuery'
   *     responses:
   *       200:
   *         description: 成功返回图书详情
   *         content:
   *           application/json:
   *             schema:
   *               $ref: '#/components/schemas/BookDetailResponse'
   *             examples:
   *               success:
   *                 $ref: '#/components/examples/BookDetailSuccess'
   *       600:
   *         description: 请求参数错误（如 bookid 非数字或小于 1）
   *         content:
   *           application/json:
   *             schema:
   *               $ref: '#/components/schemas/ApiErrorResponse'
   *             example:
   *               code: 60000
   *               msg: "提供的书籍ID不正确。"
   *               timestamp: "2026-08-14T10:00:00.000Z"
   *       404:
   *         description: 图书不存在
   *         content:
   *           application/json:
   *             schema:
   *               $ref: '#/components/schemas/ApiErrorResponse'
   *             examples:
   *               notFound:
   *                 $ref: '#/components/examples/BookDetailNotFound'
   *       500:
   *         description: 服务器内部错误
   */
  async queryBook(ctx) {
    const bookId = ctx.query.bookid * 1;
    if (isNaN(bookId)) throw new AppError("提供的书籍ID不正确。", 600);
    ctx.body = await this.#bookDetailQuery.getBookDetail(bookId);
  }

  /**
   * @swagger
   * /library/book/metadata:
   *   get:
   *     summary: 获取图书元数据（含简介）
   *     description: 根据图书 ID 返回图书基础信息及简介，用于展示图书摘要（统一包装格式）
   *     tags:
   *       - Library —— 图书馆
   *       - Book
   *     parameters:
   *       - $ref: '#/components/parameters/BookIdQuery'
   *     responses:
   *       200:
   *         description: 成功返回图书元数据
   *         content:
   *           application/json:
   *             schema:
   *               $ref: '#/components/schemas/BookMetadataResponse'
   *             examples:
   *               success:
   *                 $ref: '#/components/examples/BookMetadataSuccess'
   *       600:
   *         description: 请求参数错误（如 bookid 非数字或小于 1）
   *         content:
   *           application/json:
   *             schema:
   *               $ref: '#/components/schemas/ApiErrorResponse'
   *             example:
   *               code: 60000
   *               msg: "提供的书籍ID不正确。"
   *               timestamp: "2026-08-14T10:00:00.000Z"
   *       404:
   *         description: 图书不存在
   *       500:
   *         description: 服务器内部错误
   */
  async getMetadata(ctx) {
    const bookId = ctx.query.bookid * 1;
    if (isNaN(bookId)) throw new AppError("提供的书籍ID不正确。", 600);
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
