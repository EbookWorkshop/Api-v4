/**
 * @swagger
 * components:
 *   schemas:
 *     BookVolumeItem:
 *       type: object
 *       description: 图书分卷信息
 *       properties:
 *         Title:
 *           type: string
 *           description: 分卷标题
 *           example: "血字的研究"
 *         Introduction:
 *           type: string
 *           description: 分卷简介
 *           example: "1887年11月出版的《血字的研究》是英国推理小说家阿瑟·柯南·道尔于1887年创作的中篇小说..."
 *         OrderNum:
 *           type: integer
 *           description: 排序序号
 *           example: 52
 *         BookId:
 *           type: integer
 *           description: 所属图书 ID
 *           example: 209
 *         VolumeId:
 *           type: integer
 *           description: 分卷唯一 ID
 *           example: 52
 *       required:
 *         - Title
 *         - OrderNum
 *         - BookId
 *         - VolumeId
 *
 *     BookVolumeListResponse:
 *       allOf:
 *         - $ref: '#/components/schemas/ApiResponse'
 *         - type: object
 *           properties:
 *             data:
 *               type: array
 *               items:
 *                 $ref: '#/components/schemas/BookVolumeItem'
 *       required:
 *         - data
 *
 *   examples:
 *     BookVolumeListSuccess:
 *       summary: 图书分卷列表成功响应示例
 *       value:
 *         code: 20000
 *         msg: "success"
 *         timestamp: "2026-08-16T12:00:00.000Z"
 *         data:
 *           - Title: "血字的研究"
 *             Introduction: "1887年11月出版的《血字的研究》是英国推理小说家阿瑟·柯南·道尔于1887年创作的中篇小说，这也是他第一本以夏洛克·福尔摩斯为主角的作品。"
 *             OrderNum: 52
 *             BookId: 209
 *             VolumeId: 52
 *           - Title: "四签名"
 *             Introduction: "《四签名》是英国推理小说家阿瑟·柯南·道尔创作的第二部中篇小说..."
 *             OrderNum: 53
 *             BookId: 209
 *             VolumeId: 53
 */