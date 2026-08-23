import { UserInputError } from "../../../../5-shared/errors/index.js";

export class CreateBookRequest {
    /**
     * @swagger
     * components:
     *   schemas:
     *     CreateBookChapterItem:
     *       type: object
     *       description: 创建图书时的章节项
     *       properties:
     *         Title:
     *           type: string
     *           description: 章节标题
     *           example: "简介"
     *         Content:
     *           type: string
     *           description: 章节正文内容（支持 HTML）
     *           example: "&lt;p&gt;这是简介内容...&lt;/p&gt;"
     *         OrderNum:
     *           type: integer
     *           description: 排序号
     *           example: 1
     *       required:
     *         - Title
     *         - Content
     *         - OrderNum
     *
     *     CreateBookRequest:
     *       type: object
     *       description: 创建完整图书的请求体（包含章节）
     *       properties:
     *         bookName:
     *           type: string
     *           description: 书名
     *           example: "XxX"
     *         author:
     *           type: string
     *           description: 作者
     *           example: "佚名"
     *         cover:
     *           type: string
     *           description: 封面设置
     *           example: "佚名"
     *         type:
     *           type: string
     *           description: 文件类型（如 txt, webook 等）
     *           example: "txt"
     *         chapterList:
     *           type: array
     *           items:
     *             $ref: '#/components/schemas/CreateBookChapterItem'
     *           description: 章节列表（至少一个）
     *       required:
     *         - bookName
     *         - author
     *         - type
     *         - chapterList
     *
     *   examples:
     *     CreateBookRequestExample:
     *       summary: 创建完整图书的请求示例
     *       value:
     *         bookName: "XX"
     *         author: "佚名"
     *         type: "txt"
     *         chapterList:
     *           - Title: "简介"
     *             Content: "&lt;p&gt;这是简介内容...&lt;/p&gt;"
     *             OrderNum: -1
     *           - Title: "第一章"
     *             Content: "&lt;p&gt;第一章内容...&lt;/p&gt;"
     *             OrderNum: 1
     *           - Title: "第二章"
     *             Content: "&lt;p&gt;第二章内容...&lt;/p&gt;"
     *             OrderNum: 2
     */
    static fromBody(body) {
        const { chapterList: chaptersDTO, type, ...bookDTO } = body;
        if (!bookDTO.bookName) throw new UserInputError("导入时，书名不能为空。");
        const chap = chaptersDTO.some(c => !c.Title)
        if (chap.length) throw new UserInputError("章节名不能为空。");
        if (!bookDTO.cover) {
            if (type == "txt") bookDTO.cover = "#f2e3a4";
        }
        return { bookDTO, chaptersDTO };
    }
}