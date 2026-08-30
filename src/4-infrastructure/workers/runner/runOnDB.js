//带数据库的线程，可使用数据库的线程

import { parentPort, workerData } from 'worker_threads';
import { createMiniCore } from "../../container/miniCore.js"
import { initWorker } from "./index.js"
const { workerId, config } = workerData;
let sequelize = null;


// 启动子线程
initWorker((async () => {
    //创建线程资源
    const core = await createMiniCore(config);
    const { repositories } = core;
    sequelize = core.sequelize;
    return repositories;    //实际交给各个任务执行器的资源
})(), async () => {
    console.log(`线程【${workerId}】关闭，已运行${performance.now() / 60_000}分。`)
    if (sequelize) {
        await sequelize.close();
        console.log(`[Worker ${workerId}] Database connection closed.`);
        sequelize = null;
    }
}).catch((err) => {
    console.error('线程初始化失败:', err);
    process.exit(1);
});