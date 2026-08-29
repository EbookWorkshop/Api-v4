import { UserInputError } from "../../../../5-shared/errors/index.js"
/**
 * @swagger
 * components:
 *   schemas:
 *     UpsertChapterRequest:
 *       type: object
 *       description: 新增或修改章节的请求体（若 IndexId > 0 为修改，否则为新增）
 *       properties:
 *         IndexId:
 *           type: integer
 *           description: 章节 ID（修改时必填，新增时不传或为 0）
 *           example: 49017
 *         BookId:
 *           type: integer
 *           description: 所属图书 ID（新增时必填）
 *           example: 209
 *         Title:
 *           type: string
 *           description: 章节标题（与 Content 至少提供一个）
 *           example: "一、演绎法的研究"
 *         Content:
 *           type: string
 *           description: 章节正文内容（与 Title 至少提供一个）
 *           example: "<p>福尔摩斯正在研究...</p>"
 *         VolumeId:
 *           type: integer
 *           description: 所属分卷 ID（可选）
 *           example: 53
 *         OrderNum:
 *           type: integer
 *           description: 排序序号（可选）
 *           example: 1
 *       required:
 *         - BookId
 *         - Title
 *         - Content
 */
export class ChapterUpsertRequest {
    static fromBody(chapter) {
        if (chapter.IndexId <= 0 && !chapter.BookId) throw new UserInputError("新增章节需要指定添加的书籍。");
        if (!chapter.Content && !chapter.Title) throw new UserInputError("请求参数错误：章节标题和内容不能同时为空。");
        return chapter;
    }
}