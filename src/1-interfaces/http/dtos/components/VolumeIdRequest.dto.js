import { UserInputError } from "../../../../5-shared/errors/index.js"

export class VolumeIdRequest {
    /**
     * @swagger
     * components:
     *   parameters:
     *     VolumeIdRequest:
     *       in: query
     *       name: volumeId
     *       schema:
     *         type: integer
     *         minimum: 1
     *       required: true
     *       description: 要操作的分卷 ID
     *       example: 52
     */
    static fromQuery(query) {
        const id = query.volumeId * 1;
        if (isNaN(id) || id <= 0) throw new UserInputError("分卷Id不正确，Id必须为正整数。");
        return id;
    }
}