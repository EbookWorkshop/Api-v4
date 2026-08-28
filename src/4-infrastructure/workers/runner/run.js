import { initWorker } from "./index.js"

// 启动子线程
initWorker(null, () => {
    console.log(`线程【${workerId}】关闭，已运行${performance.now() / 60000}分。`)
}).catch((err) => {
    console.error('线程初始化失败:', err);
    process.exit(1);
});