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
     *         bookCover:
     *           type: File
     *           description: 封面文件
     *         embelBookName:
     *           type: boolean
     *           description: 是否在封面嵌入标题
     *           example: false
     *       required:
     *         - bookName
     */
    static fromBody(body, files) {
        if (!body) throw new UserInputError("传入参数不正确!");
        const { bookName, author, embelBookName } = body;
        let cover = undefined;
        if (!bookName) throw new UserInputError("书名不能为空！");
        if (files && files.bookCover) cover = files.bookCover;
        return { bookName, author: author || "佚名", cover, embelBookName: embelBookName === "true" }
    }
}