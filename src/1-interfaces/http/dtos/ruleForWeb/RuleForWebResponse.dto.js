import { UserInputError } from "../../../../5-shared/errors/index.js";
import { getHost } from "../../../../5-shared/utils/site.js"
/**
 * @swagger
 * components:
 *   schemas:
 *     BotRuleItem:
 *       type: object
 *       description: Bot 规则条目
 *       properties:
 *         host:
 *           type: string
 *           description: 规则匹配的站点主机名
 *           example: "www.example.com"
 *         ruleName:
 *           type: string
 *           description: 规则名称（如 BookName, ChapterList 等）
 *           example: "BookName"
 *         selector:
 *           type: string
 *           description: CSS 选择器，用于定位目标元素
 *           example: "#book-title"
 *         removeSelector:
 *           type: array
 *           items:
 *             type: string
 *           description: 需要从匹配结果中移除的子元素选择器列表
 *           example: [".ad", ".footer"]
 *         getContentAction:
 *           type: string
 *           description: 获取内容的方式（如 "text", "html" 等）
 *           example: "text"
 *         getUrlAction:
 *           type: string
 *           description: 获取 URL 的方式（如 "attr:href"）
 *           example: "attr:href"
 *         type:
 *           type: string
 *           description: 规则类型（如 "Object" 表示单对象，"List" 表示列表）
 *           example: "Object"
 *         checkSetting:
 *           type: string
 *           description: 额外检查配置（可为空字符串）
 *           example: ""
 *       required:
 *         - host
 *         - ruleName
 *
 *     BotRuleListResponse:
 *       allOf:
 *         - $ref: '#/components/schemas/ApiResponse'
 *         - type: object
 *           properties:
 *             data:
 *               type: array
 *               items:
 *                 $ref: '#/components/schemas/BotRuleItem'
 *       required:
 *         - data
 *   examples:
 *     BotRuleListSuccess:
 *       summary: 规则列表成功响应示例
 *       value:
 *         code: 20000
 *         msg: "success"
 *         timestamp: "2026-08-29T14:00:00.000Z"
 *         data:
 *           - host: "www.example.com"
 *             ruleName: "BookName"
 *             selector: "#book-title"
 *             removeSelector: [".ad", ".footer"]
 *             getContentAction: "text"
 *             getUrlAction: "attr:href"
 *             type: "Object"
 *             checkSetting: ""
 *           - host: "www.example.com"
 *             ruleName: "ChapterList"
 *             selector: "#chapter-list a"
 *             removeSelector: []
 *             getContentAction: "text"
 *             getUrlAction: "attr:href"
 *             type: "List"
 *             checkSetting: ""
 */

/**
 * @swagger
 * components:
 *   schemas:
 *     DictionaryItem:
 *       type: object
 *       description: Bot 规则条目
 *       properties:
 *         Host:
 *           type: string
 *           description: 应用的站点
 *           example: "www.example.com"
 *         ExecuteType:
 *           type: string
 *           description: 分类执行条件(Selector、Boolean)
 *           example: "Selector"
 *         Execute:
 *           type: string
 *           description: 应用条件：即达到条件，这份对照字典才启用
 *           example: "#book-title"
 *         Data:
 *           type: string
 *           description: 实际存储字典数据
 *           example: "a  b"
 *       required:
 *         - Host
 *         - ExecuteType
 *
 *     DictionaryListResponse:
 *       allOf:
 *         - $ref: '#/components/schemas/ApiResponse'
 *         - type: object
 *           properties:
 *             data:
 *               type: array
 *               items:
 *                 $ref: '#/components/schemas/DictionaryItem'
 *       required:
 *         - data
 *   examples:
 *     DictionaryListResponse:
 *       summary: 规则列表成功响应示例
 *       value:
 *         code: 20000
 *         msg: "success"
 *         timestamp: "2026-08-29T14:00:00.000Z"
 *         data:
 *           - Host: "www.example.com"
 *             ExecuteType: "Selector"
 *             Execute: "#book-title"
 *             Data: "a a1\nb b1"
 *           - Host: "www.example.com"
 *             ExecuteType: "Selector"
 *             Execute: "#chapter-list a"
 *             Data: "c c1\nd d1"
 */


export class HostRequest {
    /**
     * @swagger
     * components:
     *   parameters:
     *     BotRuleHostQuery:
     *       in: query
     *       name: host
     *       schema:
     *         type: string
     *       required: true
     *       description: 要查询规则的主机名
     *       example: "www.example.com"
     */
    static inQuery(query) {
        let host = query.host;
        if (!host) throw new UserInputError("网站主机名为空。");
        return getHost(host);
    }
}