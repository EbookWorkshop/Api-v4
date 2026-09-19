// 2-application/services/AutoTaskSchedulerService.js
import { UserInputError } from '../../5-shared/errors/index.js';
import { SYSTEM_AUTO_TASK } from '../constants/SystemConfigGroup.js';
import { TASK_TYPES } from "../constants/Task.js"

export class AutoTaskSchedulerService {
    #systemConfigService;
    #cron;
    #taskScheduler;
    #jobs = [];//已启动的任务
    #started = false;

    constructor({ systemConfigService, cron, taskScheduler }) {
        this.#systemConfigService = systemConfigService;
        this.#cron = cron;
        this.#taskScheduler = taskScheduler;
    }

    async start() {
        if (this.#started) return;
        this.#started = true;

        const jobs = await this.#getJobs();
        for (const job of jobs) {
            this.startJob(job);
            console.debug(`已启动${this.#jobs.length}个任务。`)
        }
    }

    async startJob(job) {
        if (job.enabled === false) return;

        const scheduledTask = this.#cron.addCron(job.cron, () => {
            this.#dispatch(job).catch((err) => {
                console.error(`[AutoTask] ${job.name} 执行失败`, err);
            });
        });
        this.#jobs.push({
            handler: scheduledTask,
            ...job
        });
    }

    /**
     * 时间到——定时任务派发
     * @param {*} job 
     * @returns 
     */
    async #dispatch(job) {
        switch (job.type) {
            case TASK_TYPES.SYSTEM_VERSION:
                return this.#taskScheduler.submitUpdateVersion();

            case TASK_TYPES.WEB_BOOK_AUTO_SYNC:
                // TODO: 这里需要扫描 AutoSyncEnabled 的书，建议再抽一个应用服务
                // 然后由它批量调用 taskScheduler.submitUpdateChapters / submitUpdateIndex
                return this.#taskScheduler.submitWebBookAutoSync?.(job.param);

            default:
                console.warn(`[AutoTask] 未知任务类型: ${job.type}`);
        }
    }

    stop() {
        for (const job of this.#jobs) {
            job?.handler?.stop?.();
        }
        this.#jobs = [];
        this.#started = false;
    }

    stopJob(name) {
        if (!name) return;
        const theJob = this.#jobs.find(j => j.name === name);
        theJob?.handler?.stop?.();
        this.#jobs = this.#jobs.filter(t => t != theJob);
    }

    async #getJobs() {
        const raw = await this.#systemConfigService.getConfigGroup(SYSTEM_AUTO_TASK);
        return raw.map(j => this.#jobDTO(j));
    }

    #jobDTO(j) {
        let obj = j.Value;
        try { obj = JSON.parse(obj); } catch { obj = { cron: "", descript: "任务配置解释失败，请重新设置任务配置。" } }
        if (obj.enabled === undefined) obj.enabled = true;
        return {
            id: j.id,
            ...obj, //cron、descript、param
            type: j.Name, name: j.Name,
        }
    }

    /**
     * 列出所有任务
     * @returns 
     */
    async listJobs() {
        const jobs = await this.#getJobs();
        return jobs.map(j => {
            j.running = this.#jobs.some(t => t.cron == j.cron && t.type == j.type);
            return j
        });
    }

    /**
     * 保存任务
     * 先尝试关闭正在运行的（如有）
     * 存储配置
     * 再尝试启动任务
     * @param {*} job 
     */
    async saveJob(job) {
        try {
            const { type, name, id, ...value } = job;
            this.stopJob(name);
            const setting = await this.#systemConfigService.setConfig(SYSTEM_AUTO_TASK, job.type, JSON.stringify(value));
            this.startJob({ type, name: type, id: setting.id, ...value });
            return { ok: true };
        } catch (error) {
            return { ok: false, error }
        }
    }

    async deleteJob(id, type) {
        this.stopJob(type);     //NOTE: 这里将Type和Name交换使用了
        return this.#systemConfigService.deleteConfig(SYSTEM_AUTO_TASK, type);
    }

    /**
     * 开/关 任务
     */
    async switchJob({ enabled, type }) {
        const raw = await this.#systemConfigService.getConfig(SYSTEM_AUTO_TASK, type);
        if (!raw) throw new UserInputError(`任务[${type}]尚未配置！`)
        const job = this.#jobDTO({ Name: type, Value: raw });
        job.enabled = enabled;
        const { type: _, name, id, ...value } = job;
        await this.#systemConfigService.setConfig(SYSTEM_AUTO_TASK, type, JSON.stringify(value));

        if (enabled) this.startJob(job);
        else this.stopJob(job.name)
        // console.log(enabled, type)
        return true;
    }
}