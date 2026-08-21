import { BookQueryService } from "../../../2-application/services/BookQueryService.js";
import { BookCommandService } from "../../../2-application/services/BookCommandService.js";
import { BookDetailQueryService } from "../../../2-application/services/BookDetailQueryService.js";

import { AppError, UserInputError } from '../../../5-shared/errors/index.js';

export class BookController {
  #bookQueryService;
  #bookCommandService;
  #bookDetailQuery;

  /**
   * 
   * @param {BookQueryService} bookQueryService 
   * @param {BookCommandService} bookCommandService 
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
    if (isNaN(bookId)) throw new UserInputError("提供的书籍ID不正确。");
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
    if (isNaN(bookId)) throw new UserInputError("提供的书籍ID不正确。");
    ctx.body = await this.#bookDetailQuery.getMetadata(bookId);
  }

  /**
   * @swagger
   * /library/book/heat:
   *   post:
   *     summary: 更新图书热度
   *     description: 根据图书 ID 更新该图书的热度值（通常由阅读行为触发），成功返回统一状态。
   *     tags:
   *       - Library —— 图书馆
   *       - Book
   *     requestBody:
   *       required: true
   *       content:
   *         application/json:
   *           schema:
   *             $ref: '#/components/schemas/BookHeatRequest'
   *           examples:
   *             default:
   *               $ref: '#/components/examples/BookHeatRequestExample'
   *     responses:
   *       200:
   *         description: 热度更新成功，返回统一成功信息
   *         content:
   *           application/json:
   *             schema:
   *               $ref: '#/components/schemas/ApiSuccessResponse'
   *       600:
   *         description: 请求参数错误（如 bookId 缺失或非数字）
   *         content:
   *           application/json:
   *             schema:
   *               $ref: '#/components/schemas/ApiErrorResponse'
   *             example:
   *               code: 60000
   *               msg: "bookId 必须为有效整数"
   *               timestamp: "2026-08-19T12:00:00.000Z"
   *       404:
   *         description: 图书不存在
   *         content:
   *           application/json:
   *             schema:
   *               $ref: '#/components/schemas/ApiErrorResponse'
   *             example:
   *               code: 40400
   *               msg: "未找到该图书"
   *               timestamp: "2026-08-19T12:00:00.000Z"
   *       500:
   *         description: 服务器内部错误
   */
  async updateBookHeat(ctx) {
    const { bookId } = ctx.request.body;

    if (isNaN(bookId)) throw new UserInputError("bookId 必须为有效整数");

    const result = await this.#bookCommandService.updateBookHeat(bookId);
    ctx.body = result;
  }

  /**
   * @swagger
   * /library/emptybook:
   *   post:
   *     summary: 创建空白图书
   *     description: 创建一个只有元数据（书名、作者）的空书记录，通常用于占位或后续上传内容（统一包装格式）
   *     tags:
   *       - Library —— 图书馆
   *       - Book
   *     requestBody:
   *       required: true
   *       content:
   *         application/json:
   *           schema:
   *             type: object
   *             properties:
   *               bookName:
   *                 type: string
   *                 description: 书名
   *                 example: "我的书籍"
   *               author:
   *                 type: string
   *                 description: 作者
   *                 example: "测试"
   *             required:
   *               - bookName
   *               - author
   *           example:
   *             bookName: "我的书籍"
   *             author: "测试"
   *     responses:
   *       200:
   *         description: 空白图书创建成功
   *         content:
   *           application/json:
   *             schema:
   *               $ref: '#/components/schemas/ApiSuccessResponse'
   *       400:
   *         description: 请求参数错误（如缺少必填字段）
   *         content:
   *           application/json:
   *             schema:
   *               $ref: '#/components/schemas/ApiErrorResponse'
   *             example:
   *               code: 40000
   *               msg: "bookName、author、type 均为必填字段"
   *               timestamp: "2026-08-21T10:00:00.000Z"
   *       500:
   *         description: 服务器内部错误
   */
  async createEmptyBook(ctx) {
    const { bookName, author } = ctx.request.body;
    if (!bookName) throw new UserInputError("书名不能为空！");
    ctx.body = await this.#bookCommandService.createEmptyBook(bookName, author);
  }

  /**
   * @swagger
   * /library/book:
   *   delete:
   *     summary: 删除图书
   *     description: 根据图书 ID 删除指定的图书及其关联数据（如章节、分卷等）（统一包装格式）
   *     tags:
   *       - Library —— 图书馆
   *       - Book
   *     parameters:
   *       - $ref: '#/components/parameters/BookIdQuery'
   *     responses:
   *       200:
   *         description: 删除成功
   *         content:
   *           application/json:
   *             schema:
   *               $ref: '#/components/schemas/ApiSuccessResponse'
   *       600:
   *         description: 参数错误（如 bookid 缺失或非数字）
   *         content:
   *           application/json:
   *             schema:
   *               $ref: '#/components/schemas/ApiErrorResponse'
   *             example:
   *               code: 60000
   *               msg: "bookid 必须为有效整数"
   *               timestamp: "2026-08-21T11:00:00.000Z"
   *       404:
   *         description: 图书不存在
   *         content:
   *           application/json:
   *             schema:
   *               $ref: '#/components/schemas/ApiErrorResponse'
   *             example:
   *               code: 40400
   *               msg: "未找到该图书"
   *               timestamp: "2026-08-21T11:00:00.000Z"
   *       500:
   *         description: 服务器内部错误
   */
  async deleteBook(ctx) {
    const bookId = ctx.query.bookid * 1;
    if (isNaN(bookId)) throw new UserInputError("bookid 必须为有效整数");
    ctx.body = await this.#bookCommandService.deleteBook(bookId);
  }
}
