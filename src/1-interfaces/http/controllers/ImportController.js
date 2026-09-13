
export class ImportController {
    #fileWriterService;
    constructor(fileWriterService) {
        this.#fileWriterService = fileWriterService;
    }

    /**
     * @swagger
     * /import/add:
     *   post:
     *     summary: 上传文件并导入
     *     description: 通过上传文件进行数据导入（统一包装格式）
     *     tags:
     *       - Import —— 书库导入
     *       - Import
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
     *                 description: 要导入的文件
     *             required:
     *               - file
     *     responses:
     *       200:
     *         description: 导入成功
     *         content:
     *           application/json:
     *             schema:
     *               $ref: '#/components/schemas/ApiSuccessResponse'
     *             example:
     *               code: 20000
     *               msg: "success"
     *               timestamp: "2026-09-13T12:00:00.000Z"
     *       400:
     *         description: 请求参数错误（未上传文件或文件格式不支持）
     *         content:
     *           application/json:
     *             schema:
     *               $ref: '#/components/schemas/ApiErrorResponse'
     *             example:
     *               code: 60000
     *               msg: "请上传文件"
     *               timestamp: "2026-09-13T12:00:00.000Z"
     *       500:
     *         description: 服务器内部错误
     */
    async add(ctx) {
        const file = ctx.request.files?.file;
        return await this.#fileWriterService.add(file);
    }
}