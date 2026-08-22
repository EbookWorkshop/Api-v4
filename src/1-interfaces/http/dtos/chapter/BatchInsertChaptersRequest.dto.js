import { UserInputError } from "../../../../5-shared/errors/index.js";

export class BatchInsertChaptersRequest {
    /**
     * @swagger
     * components:
     *   schemas:
     *     BatchChapterItem:
     *       type: object
     *       description: 批量插入的单个章节数据
     *       properties:
     *         Title:
     *           type: string
     *           description: 章节标题（与 Content 至少提供一个）
     *           example: "新章节1"
     *         Content:
     *           type: string
     *           description: 章节正文内容（与 Title 至少提供一个）
     *           example: "<p>这是新章节的内容...</p>"
     *         OrderNum:
     *           type: integer
     *           description: 排序序号（可选，服务端会自动计算偏移）
     *           example: 0
     *         VolumeId:
     *           type: integer
     *           description: 所属分卷 ID（可选，若外层 volumeId 为 -1 则使用此值，否则被覆盖）
     *           example: 53
     *       required:
     *         - Title
     *         - Content
     *
     *     BatchInsertChaptersRequest:
     *       type: object
     *       description: 批量插入章节的请求体
     *       properties:
     *         bookId:
     *           type: integer
     *           description: 所属图书 ID（必填）
     *           example: 209
     *         volumeId:
     *           type: integer
     *           description: 所属分卷 ID（传 -1 表示不设置分卷，可选）
     *           example: 53
     *         chapterList:
     *           type: array
     *           items:
     *             $ref: '#/components/schemas/BatchChapterItem'
     *           description: 章节数据列表，至少包含一个
     *       required:
     *         - bookId
     *         - chapterList
     *
     *   examples:
     *     BatchInsertChaptersRequestExample:
     *       summary: 批量插入章节请求示例
     *       value:
     *         bookId: 209
     *         volumeId: 53
     *         chapterList:
     *           - Title: "新章节1"
     *             Content: "<p>这是新章节1的内容...</p>"
     *           - Title: "新章节2"
     *             Content: "<p>这是新章节2的内容...</p>"
     */
    static fromBody(body) {
        const { bookId, volumeId, chapterList: chapters } = body;
        if (isNaN(bookId) || !Array.isArray(chapters) || chapters.length <= 0) throw new UserInputError("bookId 和 chapters 为必填字段，且 chapters 不能为空");
        return { bookId, volumeId, chapters };
    }
}