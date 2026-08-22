import { UserInputError } from "../../../../5-shared/errors/index.js";

export class EmptyBookRequest {
    /**
     * @swagger
     * components:
     *   schemas:
     *     EmptyBookRequest:
     *       type: object
     *       properties:
     *         bookName:
     *           type: string
     *           description: 书名
     *           example: "我的书籍"
     *         author:
     *           type: string
     *           description: 作者
     *           example: "测试"
     *       required:
     *         - bookName
     */
    static fromBody(body) {
        if (!body) throw new UserInputError("传入参数不正确!");
        const { bookName, author } = body;
        if (!bookName) throw new UserInputError("书名不能为空！");
        return { bookName, author: author || "佚名" }
    }
}