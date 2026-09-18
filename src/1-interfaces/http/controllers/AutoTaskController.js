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

    async saveJob(ctx) {
        const { type, cron } = ctx.request.body;
        if (!type) throw new UserInputError("保存定时任务失败：未设定任务运行类型！");
        if (!cron) throw new UserInputError("保存定时任务失败：没有设置定时表达式！");

        ctx.body = await this.#autoTaskScheduler.saveJob(ctx.request.body);
    }

    async deleteJob(ctx) {
        const { id, type } = ctx.query;
        if (isNaN(id)) throw new UserInputError("待删除的任务ID必须为数字！");
        ctx.body = await this.#autoTaskScheduler.deleteJob(id * 1, type);
    }
}