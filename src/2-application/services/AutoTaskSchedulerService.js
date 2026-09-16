// 2-application/services/AutoTaskSchedulerService.js
import { SYSTEM_AUTO_TASK } from '../constants/SystemConfigGroup.js';

export class AutoTaskSchedulerService {
    #systemConfigService;
    #cron;
    #taskScheduler;
    #jobs = [];
    #started = false;

    constructor({ systemConfigService, cron, taskScheduler }) {
        this.#systemConfigService = systemConfigService;
        this.#cron = cron;
        this.#taskScheduler = taskScheduler;
    }

    async start() {
        if (this.#started) return;
        this.#started = true;

        const raw = await this.#systemConfigService.getConfig(
            SYSTEM_AUTO_TASK,
            'jobs',
        );

        const jobs = raw ? JSON.parse(raw) : [];

        for (const job of jobs) {
            if (!job.enabled) continue;

            const scheduledTask = this.#cron.addCron(job.cron, () => {
                this.#dispatch(job).catch((err) => {
                    console.error(`[AutoTask] ${job.name} 执行失败`, err);
                });
            });

            this.#jobs.push(scheduledTask);
        }
    }

    async #dispatch(job) {
        switch (job.type) {
            case 'COMPRESS_DATABASE':
                return this.#taskScheduler.submitCompressDdatabase();

            case 'SYSTEM_VERSION':
                return this.#taskScheduler.submitUpdateVersion();

            case 'WEB_BOOK_AUTO_SYNC':
                // TODO: 这里需要扫描 AutoSyncEnabled 的书，建议再抽一个应用服务
                // 然后由它批量调用 taskScheduler.submitUpdateChapters / submitUpdateIndex
                return this.#taskScheduler.submitWebBookAutoSync?.(job.param);

            default:
                console.warn(`[AutoTask] 未知任务类型: ${job.type}`);
        }
    }

    stop() {
        for (const job of this.#jobs) {
            job?.stop?.();
        }
        this.#jobs = [];
        this.#started = false;
    }
}