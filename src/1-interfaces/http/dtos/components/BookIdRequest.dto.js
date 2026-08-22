import { UserInputError } from "../../../../5-shared/errors/index.js"

export class BookIdRequest {
    /**
     * @swagger
     * components:
     *   parameters:
     *     BookIdQuery:
     *       in: query
     *       name: bookid
     *       schema:
     *         type: integer
     *         minimum: 1
     *       required: true
     *       description: 图书 ID，必须为正整数
     *       example: 1
     */
    static fromQuery(query) {
        const bookid = query.bookid * 1;
        if (isNaN(bookid) || bookid <= 0) throw new UserInputError("提供的书籍ID不正确。");
        return bookid;
    }

    /**
     * @swagger
     * components:
     *   parameters:
     *     BookIdCamelCaseQuery:
     *       in: query
     *       name: bookId
     *       schema:
     *         type: integer
     *         minimum: 1
     *       required: true
     *       description: 图书 ID，必须为正整数。参数是驼峰式的。
     *       example: 1
     */
    static fromQueryCamelCase(query) {
        const bookId = query.bookId * 1;
        if (isNaN(bookId) || bookId <= 0) throw new UserInputError("提供的书籍ID不正确。");
        return bookId;
    }

    /**
     * @swagger
     * components:
     *   schemas:
     *     BookIdRequest:
     *       type: object
     *       description: 更新图书热度的请求体
     *       properties:
     *         bookId:
     *           type: integer
     *           description: 图书 ID
     *           example: 130
     *       required:
     *         - bookId
     * 
     *   examples:
     *     BookIdRequestExample:
     *       summary: 更新图书热度的请求体示例
     *       value:
     *         bookId: 130
     * 
     */
    static fromBody(body) {
        const { bookId } = body;
        if (isNaN(bookId)) throw new UserInputError("bookId 必须为有效整数");
        return bookId;
    }
}