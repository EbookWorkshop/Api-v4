export class FontController {
    #fontService;

    constructor(fontService) {
        this.#fontService = fontService;
    }

    /**
     * @swagger
     * /services/font:
     *   get:
     *     summary: 获取字体列表
     *     description: 返回所有可用的字体文件信息（统一包装格式）
     *     tags:
     *       - Services - Font —— 系统服务：字体管理
     *       - Font
     *     responses:
     *       200:
     *         description: 成功返回字体列表
     *         content:
     *           application/json:
     *             schema:
     *               $ref: '#/components/schemas/FontListResponse'
     *             examples:
     *               success:
     *                 $ref: '#/components/examples/FontListSuccess'
     *               empty:
     *                 $ref: '#/components/examples/FontListEmpty'
     *       500:
     *         description: 服务器内部错误
     */
    async listFonts(ctx) {
        ctx.body = await this.#fontService.getFontList();
    }

    /**
     * @swagger
     * /services/font/reading:
     *   get:
     *     summary: 获取阅读字体
     *     description: 返回当前用于阅读的字体名称（统一包装格式）
     *     tags:
     *       - Services - Font —— 系统服务：字体管理
     *       - Font
     *     responses:
     *       200:
     *         description: 成功返回阅读字体名称
     *         content:
     *           application/json:
     *             schema:
     *               $ref: '#/components/schemas/FontReadingResponse'
     *             examples:
     *               success:
     *                 $ref: '#/components/examples/FontReadingSuccess'
     *       500:
     *         description: 服务器内部错误
     */
    async getReadingFont(ctx) {
        ctx.body = await this.#fontService.getReadingFont();
    }

    /**
     * @swagger
     * /services/font/UI:
     *   get:
     *     summary: 获取 UI 字体信息
     *     description: 返回当前系统默认 UI 字体的名称和下载链接（统一包装格式）
     *     tags:
     *       - Services - Font —— 系统服务：字体管理
     *       - Font
     *     responses:
     *       200:
     *         description: 成功返回字体信息
     *         content:
     *           application/json:
     *             schema:
     *               $ref: '#/components/schemas/FontUIResponse'
     *             examples:
     *               success:
     *                 $ref: '#/components/examples/FontUISuccess'
     *       500:
     *         description: 服务器内部错误
     */
    async getUIFont(ctx) {
        ctx.body = await this.#fontService.getUIFont();
    }

    /**
     * @swagger
     * /services/font/add:
     *   post:
     *     summary: 上传字体文件
     *     description: 上传一个字体文件（TTF/WOFF等），用于系统字体库（统一包装格式）
     *     tags:
     *       - Font
     *     requestBody:
     *       required: true
     *       content:
     *         multipart/form-data:
     *           schema:
     *             type: object
     *             properties:
     *               file:
     *                 type: string
     *                 format: binary
     *                 description: 字体文件（支持 .ttf, .woff, .woff2 等）
     *           example:
     *             file: 选择文件
     *     responses:
     *       200:
     *         description: 上传成功
     *         content:
     *           application/json:
     *             schema:
     *               $ref: '#/components/schemas/ApiSuccessResponse'
     *             example:
     *               code: 20000
     *               msg: "success"
     *               timestamp: "2026-08-29T10:00:00.000Z"
     *       400:
     *         description: 请求错误（未上传文件或文件格式不支持）
     *         content:
     *           application/json:
     *             schema:
     *               $ref: '#/components/schemas/ApiErrorResponse'
     *             example:
     *               code: 60000
     *               msg: "请上传字体文件"
     *               timestamp: "2026-08-29T10:00:00.000Z"
     *       500:
     *         description: 服务器内部错误
     */
    async uploadFont(ctx) {
        const file = ctx.request.files?.file;
        const result = await this.#fontService.uploadFont(file);
        ctx.body = result;
    }

    /**
     * @swagger
     * /services/font:
     *   delete:
     *     summary: 删除字体文件
     *     description: 根据字体文件名删除系统字体库中的字体（统一包装格式）
     *     tags:
     *       - Font
     *     parameters:
     *       - in: query
     *         name: fontName
     *         schema:
     *           type: string
     *         required: true
     *         description: 要删除的字体文件名（含扩展名）
     *         example: "宋体.ttf"
     *     responses:
     *       200:
     *         description: 删除成功
     *         content:
     *           application/json:
     *             schema:
     *               $ref: '#/components/schemas/ApiSuccessResponse'
     *             example:
     *               code: 20000
     *               msg: "success"
     *               timestamp: "2026-08-29T10:00:00.000Z"
     *       400:
     *         description: 参数错误（fontName 缺失）
     *         content:
     *           application/json:
     *             schema:
     *               $ref: '#/components/schemas/ApiErrorResponse'
     *             example:
     *               code: 60000
     *               msg: "fontName 为必填参数"
     *               timestamp: "2026-08-29T10:00:00.000Z"
     *       404:
     *         description: 字体文件不存在
     *         content:
     *           application/json:
     *             schema:
     *               $ref: '#/components/schemas/ApiErrorResponse'
     *             example:
     *               code: 40400
     *               msg: "未找到该字体文件"
     *               timestamp: "2026-08-29T10:00:00.000Z"
     *       500:
     *         description: 服务器内部错误
     */
    async deleteFont(ctx) {
        const fontName = ctx.query.fontName;
        await this.#fontService.deleteFont(fontName);
        ctx.body = { success: true };
    }

    /**
     * @swagger
     * /services/font/rename:
     *   post:
     *     summary: 重命名字体文件
     *     description: 修改字体文件名（统一包装格式）
     *     tags:
     *       - Font
     *     requestBody:
     *       required: true
     *       content:
     *         application/json:
     *           schema:
     *             $ref: '#/components/schemas/RenameFontRequest'
     *           examples:
     *             default:
     *               $ref: '#/components/examples/RenameFontRequestExample'
     *     responses:
     *       200:
     *         description: 重命名成功
     *         content:
     *           application/json:
     *             schema:
     *               $ref: '#/components/schemas/ApiSuccessResponse'
     *             example:
     *               code: 20000
     *               msg: "success"
     *               timestamp: "2026-08-29T10:00:00.000Z"
     *       400:
     *         description: 请求参数错误（缺少必填字段或新名称已存在）
     *         content:
     *           application/json:
     *             schema:
     *               $ref: '#/components/schemas/ApiErrorResponse'
     *             example:
     *               code: 60000
     *               msg: "fontFile 和 newName 为必填字段"
     *               timestamp: "2026-08-29T10:00:00.000Z"
     *       500:
     *         description: 服务器内部错误
     */
    async renameFont(ctx) {
        const { fontFile, newName } = ctx.request.body;
        const result = await this.#fontService.renameFont(fontFile, newName);
        ctx.body = result;
    }

    /**
     * @swagger
     * /services/font/reading:
     *   put:
     *     summary: 设置阅读字体
     *     description: 设置系统阅读时使用的默认字体（统一包装格式）
     *     tags:
     *       - Font
     *     requestBody:
     *       required: true
     *       content:
     *         application/json:
     *           schema:
     *             $ref: '#/components/schemas/SetFontRequest'
     *           examples:
     *             default:
     *               $ref: '#/components/examples/SetReadingFontRequestExample'
     *     responses:
     *       200:
     *         description: 设置成功
     *         content:
     *           application/json:
     *             schema:
     *               $ref: '#/components/schemas/ApiSuccessResponse'
     *             example:
     *               code: 20000
     *               msg: "success"
     *               timestamp: "2026-08-29T10:00:00.000Z"
     *       400:
     *         description: 请求参数错误（fontName 缺失或字体不存在）
     *         content:
     *           application/json:
     *             schema:
     *               $ref: '#/components/schemas/ApiErrorResponse'
     *             example:
     *               code: 60000
     *               msg: "fontName 为必填字段"
     *               timestamp: "2026-08-29T10:00:00.000Z"
     *       500:
     *         description: 服务器内部错误
     */
    async setReadingFont(ctx) {
        const { fontName } = ctx.request.body;
        const result = await this.#fontService.setDefaultReadingFont(fontName);
        ctx.body = result;
    }

    /**
     * @swagger
     * /services/font/UI:
     *   put:
     *     summary: 设置UI字体
     *     description: 设置系统界面使用的默认字体（统一包装格式）
     *     tags:
     *       - Font
     *     requestBody:
     *       required: true
     *       content:
     *         application/json:
     *           schema:
     *             $ref: '#/components/schemas/SetFontRequest'
     *           examples:
     *             default:
     *               $ref: '#/components/examples/SetUIFontRequestExample'
     *     responses:
     *       200:
     *         description: 设置成功
     *         content:
     *           application/json:
     *             schema:
     *               $ref: '#/components/schemas/ApiSuccessResponse'
     *             example:
     *               code: 20000
     *               msg: "success"
     *               timestamp: "2026-08-29T10:00:00.000Z"
     *       400:
     *         description: 请求参数错误（fontName 缺失或字体不存在）
     *         content:
     *           application/json:
     *             schema:
     *               $ref: '#/components/schemas/ApiErrorResponse'
     *             example:
     *               code: 60000
     *               msg: "fontName 为必填字段"
     *               timestamp: "2026-08-29T10:00:00.000Z"
     *       500:
     *         description: 服务器内部错误
     */
    async setUIFont(ctx) {
        const { fontName } = ctx.request.body;
        const result = await this.#fontService.setDefaultUIFont(fontName);
        ctx.body = result;
    }
}