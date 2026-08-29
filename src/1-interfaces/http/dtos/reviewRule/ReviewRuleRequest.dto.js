import { UserInputError } from "../../../../5-shared/errors/index.js";
/**
 * @swagger
 * components:
 *   schemas:
 *     ReviewRuleRequest:
 *       type: object
 *       description: 创建或更新校阅规则的请求体
 *       properties:
 *         id:
 *           type: string
 *           description: |
 *             规则 ID：若为空字符串表示新建规则；若为数字字符串（如 "10"）则表示更新已有规则。
 *           example: ""
 *         name:
 *           type: string
 *           description: 规则名称
 *           example: "test"
 *         rule:
 *           type: string
 *           description: 匹配规则（正则表达式或关键词）
 *           example: "1"
 *         replace:
 *           type: string
 *           description: 替换内容
 *           example: "2"
 *         bookId:
 *           type: array
 *           description: 关联的图书 ID 列表，可选
 *           items:
 *             type: integer
 *           example: [130, 209]
 *       required:
 *         - name
 *         - rule
 *         - replace
 *
 *   examples:
 *     ReviewRuleCreateRequest:
 *       summary: 创建规则的请求体示例
 *       value:
 *         id: ""
 *         name: "test"
 *         rule: "敏感词.*"
 *         replace: "***"
 *         bookId: [130, 209]
 *
 *     ReviewRuleUpdateRequest:
 *       summary: 更新规则的请求体示例
 *       value:
 *         id: "10"
 *         name: "更新后的规则名"
 *         rule: "new_pattern"
 *         replace: "new_replace"
 *         bookId: [130]
 *
 */
export class ReviewRuleRequest {
    static fromBody(body) {
        const { id, name, rule, replace, bookId } = body;
        if (bookId?.length > 0 && bookId.some(i => isNaN(i * 1))) throw new UserInputError("bookId 必须为整数数组");
        if (!name) throw new UserInputError("规则名为必填项");
        if (!rule) throw new UserInputError("校阅规则为必填项");
        return { id, name, rule, replace, bookId };
    }
}