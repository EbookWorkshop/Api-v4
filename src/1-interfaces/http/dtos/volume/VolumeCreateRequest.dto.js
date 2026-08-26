import { UserInputError } from "../../../../5-shared/errors/index.js";

/**
 * @swagger
 * components:
 *   schemas:
 *     VolumeCreateRequest:
 *       type: object
 *       description: 创建图书分卷的请求体
 *       properties:
 *         bookId:
 *           type: integer
 *           description: 所属图书 ID
 *           example: 209
 *         title:
 *           type: string
 *           description: 分卷标题
 *           example: "血字的研究"
 *         introduction:
 *           type: string
 *           description: 分卷简介
 *           example: "1887年11月出版的《血字的研究》是英国推理小说家阿瑟·柯南·道尔于1887年创作的中篇小说，这也是他第一本以夏洛克·福尔摩斯为主角的作品。"
 *       required:
 *         - bookId
 *         - title
 *
 *   examples:
 *     VolumeCreateRequestExample:
 *       summary: 创建分卷的请求体示例
 *       value:
 *         bookId: 209
 *         title: "血字的研究"
 *         introduction: "1887年11月出版的《血字的研究》是英国推理小说家阿瑟·柯南·道尔于1887年创作的中篇小说，这也是他第一本以夏洛克·福尔摩斯为主角的作品。"
 */
export class VolumeCreateRequest {
    static fromBody(body) {
        const { bookId, title, introduction } = body;
        if (!title) throw new UserInputError("卷标题必须提供。");
        return { bookId, title, introduction };
    }
}