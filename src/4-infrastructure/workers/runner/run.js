import { initWorker } from "./index.js"
function close() {
    console.log(`线程【${workerId}】关闭，已运行${performance.now() / 60000}分。`)
}


// 启动子线程
initWorker({}, close).catch((err) => {
    console.error('线程初始化失败:', err);
    process.exit(1);
});