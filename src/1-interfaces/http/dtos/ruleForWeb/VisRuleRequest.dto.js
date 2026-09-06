import { UserInputError } from "../../../../5-shared/errors/index.js";

/**
 * @swagger
 * components:
 *   schemas:
 *     VisRuleRequest:
 *       type: object
 *       description: 可视化测试 Bot 规则的请求体
 *       properties:
 *         testUrl:
 *           type: string
 *           description: 要测试的 URL
 *           example: "https://www.example.com/book/123"
 *         ruleName:
 *           type: string
 *           description: 规则名称
 *           example: "BookName"
 *         selector:
 *           type: string
 *           description: CSS 选择器
 *           example: "#book-title"
 *         removeSelector:
 *           type: array
 *           items:
 *             type: string
 *           description: 需要移除的子元素选择器列表
 *           example: [".ad", ".footer"]
 *         getContentAction:
 *           type: string
 *           description: 获取内容的方式（如 "text", "html"）
 *           example: "text"
 *         getUrlAction:
 *           type: string
 *           description: 获取 URL 的方式（如 "attr:href"）
 *           example: "attr:href"
 *         type:
 *           type: string
 *           enum: ["Object", "List"]
 *           description: 规则类型
 *           example: "Object"
 *         checkSetting:
 *           type: string
 *           description: 额外检查配置
 *           example: ""
 *       required:
 *         - testUrl
 *         - ruleName
 *         - selector
 *         - getContentAction
 *         - type
 *   examples:
 *     VisRuleRequestExample:
 *       summary: 可视化规则测试请求示例
 *       value:
 *         testUrl: "https://www.example.com/book/123"
 *         ruleName: "BookName"
 *         selector: "#book-title"
 *         removeSelector: [".ad", ".footer"]
 *         getContentAction: "text"
 *         getUrlAction: "attr:href"
 *         type: "Object"
 *         checkSetting: ""
 */
export class VisRuleRequest {
    static fromBody(body) {
        let {
            testUrl,
            ruleName,
            selector,
            removeSelector,
            getContentAction,
            getUrlAction,
            type,
            checkSetting,
        } = body;


        if (!testUrl) throw new UserInputError("测试网址为必填。");
        if (!ruleName) throw new UserInputError("规则明为必填。");
        if (!selector) throw new UserInputError("选择器为必填。");
        if (type != "Object" && type != "List") throw new UserInputError("采集结果类型只能是【List|Object】。");
        if (getContentAction && !getContentAction.includes("/")) throw new UserInputError("内容获取规则必须包含符号【/】。");
        if (getUrlAction && !getUrlAction.includes("/")) throw new UserInputError("网址获取规则必须包含符号【/】。");

        if (typeof (removeSelector) === "string") removeSelector = removeSelector.split(",");

        return {
            testUrl, rule: {
                ruleName,
                selector,
                removeSelector,
                getContentAction,
                getUrlAction,
                type,
                checkSetting,
            }
        }
    }
}