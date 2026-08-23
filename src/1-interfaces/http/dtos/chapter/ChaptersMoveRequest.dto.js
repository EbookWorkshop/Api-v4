import { UserInputError } from "../../../../5-shared/errors/index.js";
import { ChapterRequest } from "../components/Chapter.dto.js"
export class MoveChaptersRequest {
    /**
     * @swagger
     * components:
     *   schemas:
     *     MoveChaptersRequest:
     *       type: object
     *       description: 将章节移入指定分卷的请求体
     *       properties:
     *         volumeId:
     *           type: integer
     *           description: 目标分卷 ID（必填）
     *           example: 12
     *         chapterIds:
     *           $ref: '#/components/schemas/ChaptersIdRequest'
     *           description: 要移动的章节 ID 列表
     *       required:
     *         - volumeId
     *         - chapterIds
     *
     *   examples:
     *     MoveChaptersRequestExample:
     *       summary: 移动章节到分卷的请求示例
     *       value:
     *         volumeId: 12
     *         chapterIds: [1, 2, 3]
     */
    static fromBody(body) {
        const chapterIds = ChapterRequest.fromBodyIds(body);
        const { volumeId } = body;
        if (!volumeId) throw new UserInputError(" 目标分卷 ID 为必填。");
        return { volumeId, chapterIds };
    }
}