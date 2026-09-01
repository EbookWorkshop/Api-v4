/**
 * @swagger
 * components:
 *   schemas:
 *     AutoSyncWebBookRequest:
 *       type: object
 *       description: 设置网页图书自动同步的请求体
 *       properties:
 *         bookid:
 *           type: integer
 *           description: 网页图书 ID
 *           example: 202
 *         autoSyncEnabled:
 *           type: boolean
 *           description: 是否启用自动同步
 *           example: true
 *       required:
 *         - bookid
 *         - autoSyncEnabled
 *
 *   examples:
 *     AutoSyncWebBookRequestExample:
 *       summary: 设置自动同步请求示例
 *       value:
 *         bookid: 202
 *         autoSyncEnabled: true
 */