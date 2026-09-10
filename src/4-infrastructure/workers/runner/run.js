import { workerData } from 'worker_threads';
import { initWorker } from "./index.js"
const { workerId, config } = workerData;

function close() {
    console.log(`🛑\t\t线程【${workerId}】关闭，已在线${performance.now() / 60000}分。`)
}


// 启动子线程
initWorker({ config }, close).catch((err) => {
    console.error('线程初始化失败:', err);
    process.exit(1);
});