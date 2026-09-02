//带数据库的线程，可使用数据库的线程

import { workerData } from 'worker_threads';
import { createMiniCore } from "../../container/miniCore.js"
import { initWorker } from "./index.js"
const { workerId, config } = workerData;
let sequelize = null;

//创建线程资源
async function CreateRepo() {
    const core = await createMiniCore(config);
    const { repositories } = core;
    sequelize = core.sequelize;
    return repositories;
}
async function close() {
    console.log(`线程【${workerId}】关闭，已运行${performance.now() / 60_000}分。`)
    if (sequelize) {
        await sequelize.close();
        console.log(`[Worker ${workerId}] Database connection closed.`);
        sequelize = null;
    }
}


//实际交给各个任务执行器的资源
const repositories = await CreateRepo();

// 启动子线程
initWorker(repositories, close).catch((err) => {
    console.error('线程初始化失败:', err);
    process.exit(1);
});