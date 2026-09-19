import { UserInputError } from "../../../5-shared/errors/UserInputError.js";
import { TASK_TYPES } from "../../../2-application/constants/Task.js";


export class AutoTaskController {
    #autoTaskScheduler;

    constructor(autoTaskScheduler) {
        this.#autoTaskScheduler = autoTaskScheduler;
    }

    /**
     * @swagger
     * /autotask/list:
     *   get:
     *     summary: 获取自动任务列表
     *     description: 获取自动任务列表。（尚未完成放回结构的设置）
     *     tags:
     *       - Services - 基础 —— 系统服务：基础
     *       - AutoTask
     *     responses:
     *       200:
     *         description: 成功返回任务列表
     */
    async listJobs(ctx) {
        const list = await this.#autoTaskScheduler.listJobs();
        const type = Object.keys(TASK_TYPES).filter(t => !list.some(j => j.type === t));
        ctx.body = {
            list, type
        }
    }
    /**
     * @swagger
     * /autotask:
     *   post:
     *     summary: 保存自动任务配置
     *     description: |
     *       保存一个自动任务配置。若该类型任务已存在，则先停止正在运行的旧任务，
     *       再存储新配置，并尝试启动任务。返回体中的 `ok` 表示保存是否成功（统一包装格式）。
     *     tags:
     *       - Services - 基础 —— 系统服务：基础
     *       - AutoTask
     *     requestBody:
     *       required: true
     *       content:
     *         application/json:
     *           schema:
     *             $ref: '#/components/schemas/SaveAutoTaskRequest'
     *           examples:
     *             default:
     *               $ref: '#/components/examples/SaveAutoTaskRequestExample'
     *     responses:
     *       200:
     *         description: 保存操作完成，返回执行结果
     *         content:
     *           application/json:
     *             schema:
     *               allOf:
     *                 - $ref: '#/components/schemas/ApiResponse'
     *                 - type: object
     *                   properties:
     *                     data:
     *                       $ref: '#/components/schemas/SaveAutoTaskResult'
     *             examples:
     *               success:
     *                 $ref: '#/components/examples/SaveAutoTaskSuccess'
     *               fail:
     *                 $ref: '#/components/examples/SaveAutoTaskFail'
     *       600:
     *         description: 请求参数错误（如未设置 type 或 cron）
     *         content:
     *           application/json:
     *             schema:
     *               $ref: '#/components/schemas/ApiErrorResponse'
     *             example:
     *               code: 60000
     *               msg: "保存定时任务失败：未设定任务运行类型！"
     *               timestamp: "2026-08-30T20:00:00.000Z"
     *       500:
     *         description: 服务器内部错误
     */
    async saveJob(ctx) {
        const { type, cron } = ctx.request.body;
        if (!type) throw new UserInputError("保存定时任务失败：未设定任务运行类型！");
        if (!cron) throw new UserInputError("保存定时任务失败：没有设置定时表达式！");

        ctx.body = await this.#autoTaskScheduler.saveJob(ctx.request.body);
    }

    /**
     * @swagger
     * /autotask:
     *   patch:
     *     summary: 启用/禁用自动任务
     *     description: 根据任务类型切换其启用状态（`enabled` 为布尔值时），或对已有任务执行其它编辑操作（统一包装格式）。
     *     tags:
     *       - Services - 基础 —— 系统服务：基础
     *       - AutoTask
     *     requestBody:
     *       required: true
     *       content:
     *         application/json:
     *           schema:
     *             $ref: '#/components/schemas/EditAutoTaskRequest'
     *           examples:
     *             default:
     *               $ref: '#/components/examples/EditAutoTaskRequestExample'
     *     responses:
     *       200:
     *         description: 操作结果（切换成功返回 true；其它情况返回占位对象）
     *         content:
     *           application/json:
     *             schema:
     *               allOf:
     *                 - $ref: '#/components/schemas/ApiResponse'
     *                 - type: object
     *                   properties:
     *                     data:
     *                       description: 启用/禁用成功返回布尔值；其它编辑返回占位对象
     *                       example: true
     *             examples:
     *               switch:
     *                 value:
     *                   code: 20000
     *                   msg: "success"
     *                   timestamp: "2026-08-30T20:00:00.000Z"
     *                   data: true
     *               notImplemented:
     *                 value:
     *                   code: 20000
     *                   msg: "success"
     *                   timestamp: "2026-08-30T20:00:00.000Z"
     *                   data:
     *                     message: "功能尚未开发"
     *                     data: false
     *       600:
     *         description: 请求参数错误（如 type 缺失）
     *         content:
     *           application/json:
     *             schema:
     *               $ref: '#/components/schemas/ApiErrorResponse'
     *             example:
     *               code: 60000
     *               msg: "修改定时任务失败：未设定任务运行类型！"
     *               timestamp: "2026-08-30T20:00:00.000Z"
     *       500:
     *         description: 服务器内部错误
     */
    async eidtJob(ctx) {
        const { type, enabled } = ctx.request.body;
        if (!type) throw new UserInputError("修改定时任务失败：未设定任务运行类型！");

        if (enabled !== undefined) ctx.body = await this.#autoTaskScheduler.switchJob({ type, enabled });
        else ctx.body = { message: "功能尚未开发", data: false }
    }

    /**
     * @swagger
     * /autotask:
     *   delete:
     *     summary: 删除自动任务配置
     *     description: 根据任务类型（`type`）删除对应的自动任务配置，并停止其调度（统一包装格式）。
     *     tags:
     *       - Services - 基础 —— 系统服务：基础
     *       - AutoTask
     *     parameters:
     *       - in: query
     *         name: id
     *         schema:
     *           type: integer
     *           minimum: 1
     *         required: true
     *         description: 待删除的任务 ID，必须为数字
     *         example: 1
     *       - in: query
     *         name: type
     *         schema:
     *           type: string
     *         required: true
     *         description: 任务类型（用于停止对应的定时调度）
     *         example: "SYSTEM_VERSION"
     *     responses:
     *       200:
     *         description: 删除结果，true 表示删除成功
     *         content:
     *           application/json:
     *             schema:
     *               $ref: '#/components/schemas/ApiSuccessResponse'
     *             example:
     *               code: 20000
     *               msg: "success"
     *               timestamp: "2026-08-30T20:00:00.000Z"
     *               data: true
     *       600:
     *         description: 参数错误（如 id 非数字）
     *         content:
     *           application/json:
     *             schema:
     *               $ref: '#/components/schemas/ApiErrorResponse'
     *             example:
     *               code: 60000
     *               msg: "待删除的任务ID必须为数字！"
     *               timestamp: "2026-08-30T20:00:00.000Z"
     *       500:
     *         description: 服务器内部错误
     */
    async deleteJob(ctx) {
        const { id, type } = ctx.query;
        if (isNaN(id)) throw new UserInputError("待删除的任务ID必须为数字！");
        ctx.body = await this.#autoTaskScheduler.deleteJob(id * 1, type);
    }
}