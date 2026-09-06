import { ChapterQueryService } from "../../../2-application/services/ChapterQueryService.js";
import { ChapterCommandService } from "../../../2-application/services/ChapterCommandService.js";

import { BookIdRequest } from "../dtos/components/BookIdRequest.dto.js"
import { ChapterUpsertRequest } from "../dtos/chapter/ChapterUpsertRequest.dto.js"
import { ChapterRequest } from "../dtos/components/Chapter.dto.js";
import { ChapterOrderRequest } from "../dtos/chapter/ChapterOrderRequest.dto.js";
import { BookSearchRequest } from "../dtos/book/BookSearchRequest.dto.js";
import { BatchInsertChaptersRequest } from "../dtos/chapter/BatchInsertChaptersRequest.dto.js";
import { MoveChaptersRequest } from "../dtos/chapter/ChaptersMoveRequest.dto.js";

export class ChapterController {
    #chapterQueryService;
    #chapterCommandService;

    /**
     * @param {ChapterQueryService} chapterQueryService 
     * @param {ChapterCommandService} chapterCommandService 
     */
    constructor(chapterQueryService, chapterCommandService) {
        this.#chapterQueryService = chapterQueryService;
        this.#chapterCommandService = chapterCommandService;
    }

    /**
     * @swagger
     * /library/book/chapter:
     *   get:
     *     summary: 【章】根据章节ID获取章节正文
     *     description: 根据章节 ID（目录项 ID）返回章节内容及其所属图书信息（统一包装格式）
     *     tags:
     *       - Library —— 图书馆
     *       - Chapter
     *     parameters:
     *       - $ref: '#/components/parameters/ChapterIdQuery'
     *     responses:
     *       200:
     *         description: 成功返回章节详情
     *         content:
     *           application/json:
     *             schema:
     *               $ref: '#/components/schemas/ChapterDetailResponse'
     *             examples:
     *               success:
     *                 $ref: '#/components/examples/ChapterDetailSuccess'
     *       600:
     *         description: 请求参数错误（如 chapterid 非数字或小于 1）
     *         content:
     *           application/json:
     *             schema:
     *               $ref: '#/components/schemas/ApiErrorResponse'
     *             example:
     *               code: 60000
     *               msg: "提供的章节ID不正确。"
     *               timestamp: "2026-08-15T10:00:00.000Z"
     *       404:
     *         description: 章节不存在
     *         content:
     *           application/json:
     *             schema:
     *               $ref: '#/components/schemas/ApiErrorResponse'
     *             examples:
     *               notFound:
     *                 $ref: '#/components/examples/ChapterDetailNotFound'
     *       500:
     *         description: 服务器内部错误
     */
    async getChapterById(ctx) {
        const cpId = ChapterRequest.fromQueryId(ctx.query);
        ctx.body = await this.#chapterQueryService.getChapterById(cpId);
    }

    /**
     * @swagger
     * /library/book/chapter/adjacent:
     *   get:
     *     summary: 【章】拿到相邻章节的信息
     *     description: 根据章节 ID 获取上一章和下一章的 ID，若不存在则为 null（统一包装格式）
     *     tags:
     *       - Library —— 图书馆
     *       - Chapter
     *     parameters:
     *       - $ref: '#/components/parameters/ChapterIdQuery'
     *     responses:
     *       200:
     *         description: 成功返回相邻章节 ID
     *         content:
     *           application/json:
     *             schema:
     *               $ref: '#/components/schemas/ChapterAdjacentResponse'
     *             examples:
     *               both:
     *                 $ref: '#/components/examples/ChapterAdjacentSuccess'
     *               onlyNext:
     *                 $ref: '#/components/examples/ChapterAdjacentOnlyNext'
     *               onlyPre:
     *                 $ref: '#/components/examples/ChapterAdjacentOnlyPre'
     *       600:
     *         description: 请求参数错误（如 chapterid 非数字或小于 1）
     *         content:
     *           application/json:
     *             schema:
     *               $ref: '#/components/schemas/ApiErrorResponse'
     *             example:
     *               code: 60000
     *               msg: "提供的章节ID不正确。"
     *               timestamp: "2026-08-15T10:00:00.000Z"
     *       404:
     *         description: 章节不存在
     *         content:
     *           application/json:
     *             schema:
     *               $ref: '#/components/schemas/ApiErrorResponse'
     *             examples:
     *               notFound:
     *                 $ref: '#/components/examples/ChapterAdjacentNotFound'
     *       500:
     *         description: 服务器内部错误
     */
    async getAdjacentChapter(ctx) {
        const chapterId = ChapterRequest.fromQueryId(ctx.query);
        ctx.body = await this.#chapterQueryService.getAdjacentChapter(chapterId);
    }

    /**
     * @swagger
     * /library/book/chapter/listhidden:
     *   get:
     *     summary: 【章】获取图书的隐藏章节列表
     *     description: 根据图书 ID 返回该图书下所有标记为隐藏的章节摘要（仅包含标题和 ID）（统一包装格式）
     *     tags:
     *       - Library —— 图书馆
     *       - Chapter
     *     parameters:
     *       - $ref: '#/components/parameters/BookIdQuery'
     *     responses:
     *       200:
     *         description: 成功返回隐藏章节列表
     *         content:
     *           application/json:
     *             schema:
     *               $ref: '#/components/schemas/HiddenChapterListResponse'
     *             examples:
     *               success:
     *                 $ref: '#/components/examples/HiddenChapterListSuccess'
     *               empty:
     *                 $ref: '#/components/examples/HiddenChapterListEmpty'
     *       600:
     *         description: 参数错误（如 bookid 缺失或非数字）
     *         content:
     *           application/json:
     *             schema:
     *               $ref: '#/components/schemas/ApiErrorResponse'
     *             example:
     *               code: 60000
     *               msg: "bookid 必须为有效整数"
     *               timestamp: "2026-08-21T16:00:00.000Z"
     *       500:
     *         description: 服务器内部错误
     */
    async listHiddenChapters(ctx) {
        const bookId = BookIdRequest.fromQuery(ctx.query);
        ctx.body = await this.#chapterQueryService.listHiddenChapters(bookId);
    }

    /**
     * @swagger
     * /library/book/search:
     *   post:
     *     summary: 搜索图书章节
     *     description: 根据关键词和选项搜索章节内容或标题，返回匹配的章节列表（统一包装格式）
     *     tags:
     *       - Library —— 图书馆
     *       - Chapter
     *     requestBody:
     *       required: true
     *       content:
     *         application/json:
     *           schema:
     *             $ref: '#/components/schemas/BookSearchRequest'
     *           examples:
     *             withOptions:
     *               $ref: '#/components/examples/BookSearchRequestExample'
     *             minimal:
     *               $ref: '#/components/examples/BookSearchRequestMinimal'
     *     responses:
     *       200:
     *         description: 搜索成功，返回结果列表
     *         content:
     *           application/json:
     *             schema:
     *               $ref: '#/components/schemas/BookSearchResponse'
     *             examples:
     *               success:
     *                 $ref: '#/components/examples/BookSearchSuccess'
     *               empty:
     *                 $ref: '#/components/examples/BookSearchEmpty'
     *       600:
     *         description: 请求参数错误（如 keyword 缺失、option 格式错误）
     *         content:
     *           application/json:
     *             schema:
     *               $ref: '#/components/schemas/ApiErrorResponse'
     *             example:
     *               code: 60000
     *               msg: "必须输入查询关键字"
     *               timestamp: "2026-08-19T15:00:00.000Z"
     *       500:
     *         description: 服务器内部错误
     */
    async searchBook(ctx) {
        const { keyword, option } = BookSearchRequest.fromBody(ctx.request.body);
        ctx.body = await this.#chapterQueryService.searchChapters(keyword, option);
    }

    /**
     * @swagger
     * /library/book/volume/removechapters:
     *   post:
     *     summary: 【章】<-【卷】将章节移出卷中
     *     description: 根据章节 ID 列表批量从卷中移除，返回修改的行数（统一包装格式）
     *     tags:
     *       - Library —— 图书馆
     *       - Chapter
     *     requestBody:
     *       required: true
     *       content:
     *         application/json:
     *           schema:
     *             $ref: '#/components/schemas/ChaptersIdRequest'
     *     responses:
     *       200:
     *         description: 移除成功，返回移除的行数
     *         content:
     *           application/json:
     *             schema:
     *               $ref: '#/components/schemas/ApiSuccessResponse'
     *             example:
     *               code: 20000
     *               msg: "success"
     *               timestamp: "2026-08-21T10:00:00.000Z"
     *               data: 3
     *       600:
     *         description: 请求参数错误（如 chapterIds 缺失或非数字数组）
     *         content:
     *           application/json:
     *             schema:
     *               $ref: '#/components/schemas/ApiErrorResponse'
     *             example:
     *               code: 60000
     *               msg: "chapterIds 必须为整数数组"
     *               timestamp: "2026-08-21T10:00:00.000Z"
     *       500:
     *         description: 服务器内部错误
     */
    async removeChaptersFromVolume(ctx) {
        const chapterIds = ChapterRequest.fromBodyIds(ctx.request.body);
        ctx.body = await this.#chapterCommandService.removeChaptersFromVolume(chapterIds);
    }

    /**
     * @swagger
     * /library/book/volume/movechapters:
     *   post:
     *     summary: 【章】->【卷】将章节移入指定分卷
     *     description: 批量将多个章节移动到指定的分卷中（统一包装格式）
     *     tags:
     *       - Library —— 图书馆
     *       - Chapter
     *     requestBody:
     *       required: true
     *       content:
     *         application/json:
     *           schema:
     *             $ref: '#/components/schemas/MoveChaptersRequest'
     *           examples:
     *             default:
     *               $ref: '#/components/examples/MoveChaptersRequestExample'
     *     responses:
     *       200:
     *         description: 移动成功
     *         content:
     *           application/json:
     *             schema:
     *               $ref: '#/components/schemas/ApiSuccessResponse'
     *             example:
     *               code: 20000
     *               msg: "success"
     *               timestamp: "2026-08-23T10:00:00.000Z"
     *       400:
     *         description: 请求参数错误（如 volumeId 缺失、chapterIds 为空等）
     *         content:
     *           application/json:
     *             schema:
     *               $ref: '#/components/schemas/ApiErrorResponse'
     *             example:
     *               code: 40000
     *               msg: "volumeId 和 chapterIds 均为必填字段，且 chapterIds 不能为空"
     *               timestamp: "2026-08-23T10:00:00.000Z"
     *       404:
     *         description: 指定的分卷或某些章节不存在
     *         content:
     *           application/json:
     *             schema:
     *               $ref: '#/components/schemas/ApiErrorResponse'
     *             example:
     *               code: 40400
     *               msg: "未找到目标分卷或部分章节"
     *               timestamp: "2026-08-23T10:00:00.000Z"
     *       500:
     *         description: 服务器内部错误
     */
    async moveChaptersToVolume(ctx) {
        const { volumeId, chapterIds } = MoveChaptersRequest.fromBody(ctx.request.body);
        ctx.body = await this.#chapterCommandService.moveChaptersToVolume(volumeId, chapterIds);
    }

    /**
     * @swagger
     * /library/book/chapter:
     *   post:
     *     summary: 【章】新增或修改章节
     *     description: |
     *       根据 `IndexId` 判断操作类型：
     *       - 若 `IndexId` > 0：修改对应章节
     *       - 若 `IndexId` <= 0 且 `BookId` > 0：新增章节
     *       - 否则返回参数错误
     *       要求 `Title` 和 `Content` 至少提供一个。
     *     tags:
     *       - Library —— 图书馆
     *       - Chapter
     *     requestBody:
     *       required: true
     *       content:
     *         application/json:
     *           schema:
     *             $ref: '#/components/schemas/UpsertChapterRequest'
     *           example:
     *             IndexId: 0
     *             BookId: 209
     *             Title: "一、演绎法的研究"
     *             Content: "<p>福尔摩斯正在研究...</p>"
     *             VolumeId: 53
     *             OrderNum: 1
     *     responses:
     *       200:
     *         description: 操作成功，返回200
     *         content:
     *           application/json:
     *             schema:
     *               $ref: '#/components/schemas/ApiSuccessResponse'
     *       600:
     *         description: 请求参数错误（如缺少 Title 和 Content、IndexId 和 BookId 不匹配等）
     *         content:
     *           application/json:
     *             schema:
     *               $ref: '#/components/schemas/ApiErrorResponse'
     *             example:
     *               code: 60000
     *               msg: "请求参数错误"
     *               timestamp: "2026-08-21T13:00:00.000Z"
     *       404:
     *         description: 修改时指定的章节不存在
     *         content:
     *           application/json:
     *             schema:
     *               $ref: '#/components/schemas/ApiErrorResponse'
     *             example:
     *               code: 40400
     *               msg: "未找到该章节"
     *               timestamp: "2026-08-21T13:00:00.000Z"
     *       500:
     *         description: 服务器内部错误
     */
    async upsertChapter(ctx) {
        const chapter = ChapterUpsertRequest.fromBody(ctx.request.body);
        ctx.body = await this.#chapterCommandService.upsertChapter(chapter);
    }

    /**
     * @swagger
     * /library/book/chapter:
     *   delete:
     *     summary: 【章】根据章节ID删除章节
     *     description: 根据章节 ID（目录项 ID）删除章节
     *     tags:
     *       - Library —— 图书馆
     *       - Chapter
     *     parameters:
     *       - $ref: '#/components/parameters/ChapterIdQuery'
     *     responses:
     *       200:
     *         description: 成功返回删除数量
     *         content:
     *           application/json:
     *             schema:
     *               $ref: '#/components/schemas/ApiSuccessResponse'
     *       600:
     *         description: 请求参数错误（如 chapterid 非数字或小于 1）
     *         content:
     *           application/json:
     *             schema:
     *               $ref: '#/components/schemas/ApiErrorResponse'
     *             example:
     *               code: 60000
     *               msg: "提供的章节ID不正确。"
     *               timestamp: "2026-08-15T10:00:00.000Z"
     *       500:
     *         description: 服务器内部错误
     */
    async deleteChapter(ctx) {
        const cpId = ChapterRequest.fromQueryId(ctx.query);
        ctx.body = await this.#chapterCommandService.deleteChapter(cpId);
    }

    /**
     * @swagger
     * /library/book/chapter:
     *   patch:
     *     summary: 【章】批量插入章节
     *     description: 在指定图书（和可选分卷）下批量插入多个章节，服务端自动计算排序序号（统一包装格式）
     *     tags:
     *       - Library —— 图书馆
     *       - Chapter
     *     requestBody:
     *       required: true
     *       content:
     *         application/json:
     *           schema:
     *             $ref: '#/components/schemas/BatchInsertChaptersRequest'
     *           examples:
     *             default:
     *               $ref: '#/components/examples/BatchInsertChaptersRequestExample'
     *     responses:
     *       200:
     *         description: 批量插入成功
     *         content:
     *           application/json:
     *             schema:
     *               $ref: '#/components/schemas/ApiSuccessResponse'
     *       600:
     *         description: 请求参数错误（如缺少必填字段、chapters 为空等）
     *         content:
     *           application/json:
     *             schema:
     *               $ref: '#/components/schemas/ApiErrorResponse'
     *             example:
     *               code: 60000
     *               msg: "bookId 和 chapters 为必填字段，且 chapters 不能为空"
     *               timestamp: "2026-08-21T17:00:00.000Z"
     *       404:
     *         description: 指定的图书或分卷不存在
     *         content:
     *           application/json:
     *             schema:
     *               $ref: '#/components/schemas/ApiErrorResponse'
     *             example:
     *               code: 40400
     *               msg: "未找到该图书"
     *               timestamp: "2026-08-21T17:00:00.000Z"
     *       500:
     *         description: 服务器内部错误
     */
    async batchInsertChapters(ctx) {
        const chapters = BatchInsertChaptersRequest.fromBody(ctx.request.body);
        ctx.body = await this.#chapterCommandService.batchInsertChapters(chapters);
    }

    /**
     * @swagger
     * /library/book/chapter/order:
     *   patch:
     *     summary: 【章】批量更新章节排序
     *     description: 接收一个数组，每个元素包含章节 ID（indexId）和新的排序值（newOrder），用于批量调整章节顺序（统一包装格式）
     *     tags:
     *       - Library —— 图书馆
     *       - Chapter
     *     requestBody:
     *       required: true
     *       content:
     *         application/json:
     *           schema:
     *             $ref: '#/components/schemas/ChapterOrderRequest'
     *           examples:
     *             default:
     *               $ref: '#/components/examples/ChapterOrderRequestExample'
     *     responses:
     *       200:
     *         description: 更新成功
     *         content:
     *           application/json:
     *             schema:
     *               $ref: '#/components/schemas/ApiSuccessResponse'
     *       600:
     *         description: 请求参数错误（如数组为空、缺少必填字段等）
     *         content:
     *           application/json:
     *             schema:
     *               $ref: '#/components/schemas/ApiErrorResponse'
     *             example:
     *               code: 60000
     *               msg: "请求体必须为非空数组，且每个元素需包含 indexId 和 newOrder"
     *               timestamp: "2026-08-21T14:00:00.000Z"
     *       500:
     *         description: 服务器内部错误
     */
    async updateChapterOrder(ctx) {
        const orderData = ChapterOrderRequest.fromBody(ctx.request.body);
        ctx.body = await this.#chapterCommandService.updateOrder(orderData);
    }

    /**
     * @swagger
     * /library/book/chapter/toggleHide:
     *   patch:
     *     summary: 【章】切换章节是否隐藏
     *     description: 切换章节是否隐藏，设置隐藏状态为当前状态的反转
     *     tags:
     *       - Library —— 图书馆
     *       - Chapter
     *     requestBody:
     *       required: true
     *       content:
     *         application/json:
     *           schema:
     *             $ref: '#/components/schemas/ChapterIdRequest'
     *           examples:
     *             default:
     *               $ref: '#/components/examples/ChapterIdRequestExample'
     *     responses:
     *       200:
     *         description: 操作成功
     *         content:
     *           application/json:
     *             schema:
     *               $ref: '#/components/schemas/ApiSuccessResponse'
     *       600:
     *         description: 请求参数错误（如 chapterId 缺失或非数字）
     *         content:
     *           application/json:
     *             schema:
     *               $ref: '#/components/schemas/ApiErrorResponse'
     *             example:
     *               code: 60000
     *               msg: "章节ID出错：章节ID只能为正整数。"
     *               timestamp: "2026-08-21T14:00:00.000Z"
     *       404:
     *         description: 指定的章节不存在
     *         content:
     *           application/json:
     *             schema:
     *               $ref: '#/components/schemas/ApiErrorResponse'
     *             example:
     *               code: 40400
     *               msg: "待操作的章节不存在。"
     *               timestamp: "2026-08-21T14:00:00.000Z"
     *       500:
     *         description: 服务器内部错误
     */
    async toggleHide(ctx) {
        const chapterId = ChapterRequest.fromBodyId(ctx.request.body);
        ctx.body = await this.#chapterCommandService.toggleHide(chapterId);
    }

    /**
     * @swagger
     * /library/book/chapter/tointroduction:
     *   post:
     *     summary: 【章】将章节设为简介
     *     description: 将指定章节标记为图书的简介章节（统一包装格式）
     *     tags:
     *       - Library —— 图书馆
     *       - Chapter
     *     requestBody:
     *       required: true
     *       content:
     *         application/json:
     *           schema:
     *             $ref: '#/components/schemas/ChapterIdRequest'
     *           examples:
     *             default:
     *               $ref: '#/components/examples/ChapterIdRequestExample'
     *     responses:
     *       200:
     *         description: 操作成功
     *         content:
     *           application/json:
     *             schema:
     *               $ref: '#/components/schemas/ApiSuccessResponse'
     *       600:
     *         description: 请求参数错误（如 chapterId 缺失或非数字）
     *         content:
     *           application/json:
     *             schema:
     *               $ref: '#/components/schemas/ApiErrorResponse'
     *             example:
     *               code: 60000
     *               msg: "章节ID出错：章节ID只能为正整数。"
     *               timestamp: "2026-08-21T14:00:00.000Z"
     *       404:
     *         description: 指定的章节不存在
     *         content:
     *           application/json:
     *             schema:
     *               $ref: '#/components/schemas/ApiErrorResponse'
     *             example:
     *               code: 40400
     *               msg: "待操作的章节不存在。"
     *               timestamp: "2026-08-21T14:00:00.000Z"
     *       500:
     *         description: 服务器内部错误
     */
    async setChapterAsIntroduction(ctx) {
        const chapterId = ChapterRequest.fromBodyId(ctx.request.body);
        ctx.body = await this.#chapterCommandService.setAsIntroduction(chapterId);
    }
}
