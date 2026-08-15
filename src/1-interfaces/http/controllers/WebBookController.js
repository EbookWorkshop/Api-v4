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

  /**
   * @swagger
   * /library/webbook/list:
   *   get:
   *     summary: 获取网页图书列表
   *     description: 返回包含网页扩展信息的图书列表（统一包装格式）
   *     tags:
   *       - Library - WebBook —— 网文图书馆
   *       - WebBook
   *     responses:
   *       200:
   *         description: 成功返回网页图书列表
   *         content:
   *           application/json:
   *             schema:
   *               $ref: '#/components/schemas/WebBookListResponse'
   *             examples:
   *               success:
   *                 $ref: '#/components/examples/WebBookListSuccess'
   *               empty:
   *                 $ref: '#/components/examples/WebBookListEmpty'
   *       500:
   *         description: 服务器内部错误
   */
  async listBooks(ctx) {
    ctx.body = await this.#webBookQueryService.getBookList();
  }

  /**
   * @swagger
   * /library/webbook:
   *   get:
   *     summary: 获取网页图书详情
   *     description: 根据图书 ID 返回包含网页扩展信息的图书详情（含目录、分卷），与普通图书详情相比多出 WebBookName、AutoSyncEnabled 和 WebBookId 字段（统一包装格式）
   *     tags:
   *       - Library - WebBook —— 网文图书馆
   *       - WebBook
   *     parameters:
   *       - $ref: '#/components/parameters/BookIdQuery'
   *     responses:
   *       200:
   *         description: 成功返回网页图书详情
   *         content:
   *           application/json:
   *             schema:
   *               $ref: '#/components/schemas/WebBookDetailResponse'
   *             examples:
   *               success:
   *                 $ref: '#/components/examples/WebBookDetailSuccess'
   *       600:
   *         description: 请求参数错误（如 bookid 非数字或小于 1）
   *         content:
   *           application/json:
   *             schema:
   *               $ref: '#/components/schemas/ApiErrorResponse'
   *             example:
   *               code: 60000
   *               msg: "提供的书籍ID不正确。"
   *               timestamp: "2026-08-16T10:00:00.000Z"
   *       404:
   *         description: 图书不存在
   *         content:
   *           application/json:
   *             schema:
   *               $ref: '#/components/schemas/ApiErrorResponse'
   *             examples:
   *               notFound:
   *                 $ref: '#/components/examples/WebBookDetailNotFound'
   *       500:
   *         description: 服务器内部错误
   */
  async queryBook(ctx) {
    const bookId = ctx.query.bookid * 1;
    if (isNaN(bookId)) throw new AppError("提供的书籍ID不正确。", 600);
    ctx.body = await this.#webBookDetailQuery.getBookDetail(bookId);
  }



}
