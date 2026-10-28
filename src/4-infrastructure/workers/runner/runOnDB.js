//带数据库的线程，可使用数据库的线程

import { workerData } from 'worker_threads';
import { createMiniCore } from "../../container/miniCore.js"
import { initWorker } from "./index.js";
const { config } = workerData;
/** @type {import("sequelize").Sequelize?} */
let sequelize = null;
let logger = null;

//创建线程资源
async function CreateRepo() {
    const core = await createMiniCore(config);
    const { repositories, transactionManager, logger: _logger } = core;
    sequelize = core.sequelize;
    logger = _logger;
    return { repositories, transactionManager };
}
async function close() {
    logger.debug(`🛑\t\t线程关闭，已在线 ${(performance.now() / 60_000).toFixed(1)} 分钟。`);
    if (sequelize) {
        await sequelize?.close();
        // logger.log(`[Worker ${workerId}] Database connection closed.`);
        sequelize = null;
    }
}


//实际交给各个任务执行器的资源
const resources = await CreateRepo();

// 启动子线程
initWorker(resources, close).catch((err) => {
    logger.error('线程初始化失败:', err);
    process.exit(1);
});