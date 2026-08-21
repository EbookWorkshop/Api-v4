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