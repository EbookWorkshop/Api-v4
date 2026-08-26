import path from 'node:path';
import { AsyncLocalStorage } from 'async_hooks';
import { parentPort, workerData } from 'worker_threads';
import { TASK_MESSAGE_TYPE as TMT, TASK_TYPES } from "../../../3-domain/constants/Task.js"
import { assignTasks } from "../tasks/assignTasks.js"
const { workerId, config } = workerData;

async function init() {
    try {
        parentPort.on('message', async (task) => {
            await runTask(task);
        });

        process.on('SIGTERM', async () => {
            console.log('🛑 子线程收到终止信号，正在关闭...');
            process.exit(0);
        });
    } catch (error) {
        const errorPayload = {
            type: TMT.TASK_ERROR,
            workerId,
            error: {
                message: error.message,
                stack: error.stack,
                code: error.code || 'UNKNOWN',
            },
        };
        parentPort.postMessage(errorPayload);
    }
}

async function runTask(task) {
    const { taskId, taskfile, taskType, param } = task;
    (new AsyncLocalStorage()).run({ entryPath: taskfile }, async () => {//为子线程创建一个运行上下文，可以用于传送信息、调试等
        try {
            console.log("收到线程任务，参数", param);
            let result = null;
            //执行线程逻辑
            const taskExe = assignTasks(taskType);
            result = await taskExe.execute(taskType, param);

            parentPort.postMessage({
                type: TMT.TASK_COMPLETED,
                taskId,
                data: result,
            });
        } catch (error) {
            const errorPayload = {
                type: TMT.TASK_ERROR,
                workerId,
                taskId,
                error: {
                    message: error.message,
                    stack: error.stack,
                    code: error.code || 'UNKNOWN',
                },
            };
            parentPort.postMessage(errorPayload);
        }
    });
}


// 启动子线程
init().catch((err) => {
    console.error('线程初始化失败:', err);
    process.exit(1);
});