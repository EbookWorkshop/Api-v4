/**
 * @swagger
 * components:
 *   parameters:
 *     TagIdQuery:
 *       in: query
 *       name: tagid
 *       schema:
 *         type: integer
 *         minimum: 1
 *       required: false
 *       description: 包含指定标签 ID 的图书，负数或非数字将忽略（例如 23）
 *       example: 23
 *     NotTagQuery:
 *       in: query
 *       name: nottag
 *       schema:
 *         type: string
 *         pattern: '^\d+(,\d+)*$'
 *       required: false
 *       description: 排除指定标签 ID 的图书，多个 ID 用逗号分隔（例如 43,34）
 *       example: "43,34"
 */
export class BookListRequest {
    /**
     * @param {Object} query - Koa ctx.query 原始对象
     * 职责：将原始 HTTP 查询参数解析为结构化的业务参数
     */
    static fromQuery(query) {
        // 1. 解析 tagId（确保是数字）
        const tagId = query.tagid ? parseInt(query.tagid, 10) : 0;

        // 2. 解析 nottag（字符串 '1,2,3' -> 数组 [1,2,3]）
        let excludeTagIds = [];
        if (query.nottag) {
            excludeTagIds = query.nottag
                .split(',')
                .map(t => parseInt(t, 10))
                .filter(n => !isNaN(n)); // 过滤无效数字
        }

        if (excludeTagIds.some(t => isNaN(t))) throw new AppError("排除标签必须为正整数，多个排除标签可用英文逗号隔开。", 600);
        return {
            tagId,
            excludeTagIds,
        };
    }
}