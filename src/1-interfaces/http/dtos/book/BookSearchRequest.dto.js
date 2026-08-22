import { UserInputError } from "../../../../5-shared/errors/index.js";

/**
 * @swagger
 * components:
 *   schemas:
 *     SearchOption:
 *       type: object
 *       description: 搜索选项（可选）
 *       properties:
 *         type:
 *           type: string
 *           enum: [title, content]
 *           description: 搜索范围：按标题或内容搜索
 *           example: "title"
 *         bookId:
 *           type: array
 *           description: 限定搜索的图书 ID 列表
 *           items:
 *             type: integer
 *           example: [12, 32, 44]
 *         notFind:
 *           type: array
 *           description: 排除的图书 ID 列表
 *           items:
 *             type: integer
 *           example: [22, 33]
 *
 *     BookSearchRequest:
 *       type: object
 *       description: 图书搜索请求体
 *       required:
 *         - keyword
 *       properties:
 *         keyword:
 *           type: string
 *           description: 搜索关键词
 *           example: "福尔摩斯"
 *         option:
 *           $ref: '#/components/schemas/SearchOption'
 *           description: 搜索选项（可选）
  *   examples:
 *     BookSearchRequestExample:
 *       summary: 搜索请求示例（带选项）
 *       value:
 *         keyword: "福尔摩斯"
 *         option:
 *           type: "title"
 *           bookId: [12, 32, 44]
 *           notFind: [22, 33]
 *
 *     BookSearchRequestMinimal:
 *       summary: 搜索请求示例（仅关键词）
 *       value:
 *         keyword: "福尔摩斯"
 */
export class BookSearchRequest {
    static fromBody(body) {
        const { keyword, option } = body;
        if (!keyword) throw new UserInputError("必须输入查询关键字");
        if (keyword.length > 50) return { keyword: keyword.substring(0, 50), option };
        return { keyword, option }
    }
}