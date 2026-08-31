import { WebBookQueryService } from "../../../2-application/services/WebBookQueryService.js";
import { WebBookDetailQueryService } from "../../../2-application/services/WebBookDetailQueryService.js";
import { BookIdRequest } from "../dtos/components/BookIdRequest.dto.js"


export class WebBookController {
    #webBookQueryService;
    #webBookCommandService;
    #webBookDetailQuery;
    #bookCommandService;
    #taskSchedulerService;

    /**
     * 
     * @param {WebBookQueryService} webBookQueryService 
     * @param {WebBookCommandService} webBookCommandService 
     * @param {WebBookDetailQueryService} webBookDetailQuery 
     * @param {BookCommandService} bookCommandService 
     */
    constructor(webBookQueryService, webBookCommandService, webBookDetailQuery, bookCommandService, task) {
        this.#webBookQueryService = webBookQueryService;
        this.#webBookCommandService = webBookCommandService;
        this.#webBookDetailQuery = webBookDetailQuery;
        this.#bookCommandService = bookCommandService;
        this.#taskSchedulerService = task;

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
    async getBookById(ctx) {
        const bookId = BookIdRequest.fromQuery(ctx.query);
        ctx.body = await this.#webBookDetailQuery.getBookDetail(bookId);
    }

    /**
     * @swagger
     * /library/webbook/sources:
     *   get:
     *     summary: 获取网页图书的源列表
     *     description: 根据图书 ID 返回该书关联的所有网页源（统一包装格式）
     *     tags:
     *       - Library - WebBook —— 网文图书馆
     *       - WebBook
     *     parameters:
     *       - $ref: '#/components/parameters/BookIdQuery'
     *     responses:
     *       200:
     *         description: 成功返回源列表
     *         content:
     *           application/json:
     *             schema:
     *               $ref: '#/components/schemas/WebBookSourceListResponse'
     *             examples:
     *               success:
     *                 $ref: '#/components/examples/WebBookSourceListSuccess'
     *               empty:
     *                 $ref: '#/components/examples/ResultListEmpty'
     *       400:
     *         description: 参数错误（bookid 缺失或非数字）
     *         content:
     *           application/json:
     *             schema:
     *               $ref: '#/components/schemas/ApiErrorResponse'
     *             example:
     *               code: 60000
     *               msg: "bookid 必须为有效整数"
     *               timestamp: "2026-08-31T10:00:00.000Z"
     *       500:
     *         description: 服务器内部错误
     */
    async getWebBookSources(ctx) {
        const bookId = BookIdRequest.fromQuery(ctx.query);
        ctx.body = await this.#webBookQueryService.getBookSources(bookId);
    }

    /**
     * @swagger
     * /library/webbook/defsources:
     *   get:
     *     summary: 获取网页图书的默认源列表
     *     description: 根据图书 ID 返回该书关联的默认网页源（统一包装格式）。
     *     tags:
     *       - Library - WebBook —— 网文图书馆
     *       - WebBook
     *     parameters:
     *       - $ref: '#/components/parameters/BookIdQuery'
     *     responses:
     *       200:
     *         description: 成功返回源列表
     *         content:
     *           application/json:
     *             schema:
     *               $ref: '#/components/schemas/WebBookSourceListResponse'
     *             examples:
     *               success:
     *                 $ref: '#/components/examples/WebBookSourceListSuccess'
     *               empty:
     *                 $ref: '#/components/examples/ResultListEmpty'
     *       400:
     *         description: 参数错误（bookid 缺失或非数字）
     *         content:
     *           application/json:
     *             schema:
     *               $ref: '#/components/schemas/ApiErrorResponse'
     *             example:
     *               code: 60000
     *               msg: "bookid 必须为有效整数"
     *               timestamp: "2026-08-31T10:00:00.000Z"
     *       500:
     *         description: 服务器内部错误
     */
    async getWebBookDefSources(ctx) {
        const bookId = BookIdRequest.fromQuery(ctx.query);
        ctx.body = await this.#webBookQueryService.getDefSources(bookId);
    }

    /**
     * @swagger
     * /library/webbook:
     *   post:
     *     summary: 创建网页图书
     *     description: 根据提供的源页面和信息页面创建网页图书记录（统一包装格式）
     *     tags:
     *       - Library - WebBook —— 网文图书馆
     *       - WebBook
     *     requestBody:
     *       required: true
     *       content:
     *         application/json:
     *           schema:
     *             $ref: '#/components/schemas/CreateWebBookRequest'
     *           examples:
     *             default:
     *               $ref: '#/components/examples/CreateWebBookRequestExample'
     *     responses:
     *       200:
     *         description: 创建成功
     *         content:
     *           application/json:
     *             schema:
     *               $ref: '#/components/schemas/ApiSuccessResponse'
     *             example:
     *               code: 20000
     *               msg: "success"
     *               timestamp: "2026-08-31T14:00:00.000Z"
     *       400:
     *         description: 请求参数错误（如缺少必填字段或 URL 格式不正确）
     *         content:
     *           application/json:
     *             schema:
     *               $ref: '#/components/schemas/ApiErrorResponse'
     *             example:
     *               code: 60000
     *               msg: "sourcePage 和 infoPage 为必填字段，且需为有效 URL"
     *               timestamp: "2026-08-31T14:00:00.000Z"
     *       500:
     *         description: 服务器内部错误
     */
    async createWebBook(ctx) {
        const { url, ...setting } = ctx.request.body;
        if (url && !setting.sourcePage) setting.sourcePage = url;
        ctx.body = await this.#taskSchedulerService.submitCreateWebBookTask(setting);
    }

    /**
     * @swagger
     * /library/webbook:
     *   delete:
     *     summary: 删除图书
     *     description: 根据图书 ID 删除指定的图书及其关联数据（如章节、分卷等）（统一包装格式）
     *     tags:
     *       - Library - WebBook —— 网文图书馆
     *       - WebBook
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
        const bookId = BookIdRequest.fromQuery(ctx.query);
        ctx.body = await this.#bookCommandService.deleteBook(bookId);
    }
}
