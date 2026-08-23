import { UserInputError } from "../../../../5-shared/errors/index.js";

export class UpdateBookMetadataRequest {
    /**
     * @swagger
     * components:
     *   schemas:
     *     UpdateBookMetadataRequest:
     *       type: object
     *       description: 更新图书元数据的请求体（仅需传入要修改的字段）
     *       properties:
     *         id:
     *           type: integer
     *           description: 图书 ID（必填）
     *           example: 209
     *         name:
     *           type: string
     *           description: 新的书名（可选）
     *           example: "福尔摩斯探案全集（修订版）"
     *         author:
     *           type: string
     *           description: 新的作者（可选）
     *           example: "阿瑟·柯南·道尔"
     *         bookCover:
     *           type: string
     *           description: 封面颜色值或图片路径（可选）
     *           example: "#f2e3a4"
     *         coverFile:
     *           type: string
     *           description: 封面图片文件路径（可选，与 bookCover 二选一）
     *           example: "/cover/new_cover.jpg"
     *         introduction:
     *           type: string
     *           description: 新的图书简介（可选）
     *           example: "这是修订后的简介..."
     *         coverType:
     *           type: string
     *           description: 封面类型，可选。设置为“默认”时，即设置为蓝色线装本封面
     *           example: "默认"
     *       required:
     *         - id
     *
     *   examples:
     *     UpdateBookMetadataRequestExample:
     *       summary: 更新图书元数据的请求示例（完整字段）
     *       value:
     *         id: 209
     *         name: "福尔摩斯探案全集（修订版）"
     *         author: "阿瑟·柯南·道尔"
     *         bookCover: "#f2e3a4"
     *         coverFile: "/cover/new_cover.jpg"
     *         introduction: "这是修订后的简介..."
     *         coverType: "color"
     *
     *     UpdateBookMetadataRequestPartial:
     *       summary: 仅更新部分字段的示例
     *       value:
     *         id: 209
     *         name: "新书名"
     *         introduction: "更新简介"
     */
    static fromBody(body) {
        let bookInfo = body;
        if (!bookInfo) throw new UserInputError("没有传入数据。");
        bookInfo.id *= 1;
        if (!bookInfo.id || isNaN(bookInfo.id)) throw new UserInputError("书籍Id缺失或格式不正确。");
        let metadata = { id: bookInfo.id };
        if (bookInfo.name) metadata.BookName = bookInfo.name;
        if (bookInfo.author) metadata.Author = bookInfo.author;
        if (bookInfo.bookCover) metadata.CoverImg = bookInfo.bookCover;
        if (bookInfo.coverFile && Array.isArray(bookInfo.coverFile)) metadata.converFile = bookInfo.coverFile[0];
        if (bookInfo.introduction) metadata.Introduction = bookInfo.introduction;
        if (bookInfo.coverType === "默认") metadata.CoverImg = null;

        return metadata;
    }
}