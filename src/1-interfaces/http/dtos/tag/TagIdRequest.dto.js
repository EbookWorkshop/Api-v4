import { UserInputError } from "../../../../5-shared/errors/index.js"
/**
 * @swagger
 * components:
 *   parameters:
 *     TagIdRequest:
 *       in: query
 *       name: tagid
 *       schema:
 *         type: integer
 *         minimum: 1
 *       required: true
 *       description: 标签 ID，必须为正整数
 *       example: 1
 */
export class TagIdQuery {
    static fromQuery(query) {
        const tagid = query.tagid * 1;
        if (isNaN(tagid) || tagid <= 0) throw new UserInputError("标签ID不正确。");
        return tagid;
    }
}