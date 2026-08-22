import { UserInputError } from "../../../../5-shared/errors/index.js";
/**
 * @swagger
 * components:
 *   schemas:
 *     UpdateVolumeRequest:
 *       type: object
 *       description: 更新分卷的请求体
 *       properties:
 *         volumeId:
 *           type: integer
 *           description: 要更新的分卷 ID（必填）
 *           example: 52
 *         title:
 *           type: string
 *           description: 新的分卷标题（可选）
 *           example: "血字的研究（修订版）"
 *         introduction:
 *           type: string
 *           description: 新的分卷简介（可选）
 *           example: "修订后的简介内容..."
 *       required:
 *         - volumeId
 *
 *   examples:
 *     UpdateVolumeRequestExample:
 *       summary: 更新分卷的请求体示例（完整字段）
 *       value:
 *         volumeId: 52
 *         title: "血字的研究（修订版）"
 *         introduction: "修订后的简介内容..."
 *
 *     UpdateVolumeRequestPartial:
 *       summary: 更新分卷的请求体示例（仅更新部分字段）
 *       value:
 *         volumeId: 52
 *         title: "血字的研究（修订版）"
 */
export class UpdateVolumeRequest {
    static fromBody(body) {
        const { volumeId, title, introduction } = body;
        if (isNaN(volumeId)) throw new UserInputError("volumeId 必须为有效整数");
        if (!title) throw new UserInputError("卷标题必须提供。");
        return { volumeId, title, introduction };
    }
}