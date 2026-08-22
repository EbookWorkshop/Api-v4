import { UserInputError } from "../../../../5-shared/errors/index.js"
/**
 * @swagger
 * components:
 *   parameters:
 *     IdRequest:
 *       in: query
 *       name: id
 *       schema:
 *         type: integer
 *         minimum: 1
 *       required: true
 *       description: 需要操作的Id，必须为正整数
 *       example: 1
 */
export class IdRequest {
    static fromQuery(query) {
        const id = query.id * 1;
        if (isNaN(id) || id <= 0) throw new UserInputError("Id不正确，Id必须为正整数。");
        return id;
    }
}