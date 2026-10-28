import { workerData } from 'worker_threads';
import { initWorker } from "./index.js"
import { logger } from '../../../5-shared/logging/index.js';
const { config } = workerData;

function close() {
    logger.debug(`🛑\t\t线程关闭，已在线 ${(performance.now() / 60_000).toFixed(1)} 分钟。`);
}


// 启动子线程
initWorker({ config }, close).catch((err) => {
    logger.error('线程初始化失败:', err);
    process.exit(1);
});