//带数据库的线程，可使用数据库的线程

import path from 'node:path';
import { AsyncLocalStorage } from 'async_hooks';
import { parentPort, workerData } from 'worker_threads';
import { TASK_MESSAGE_TYPE as TMT, TASK_TYPES } from "../../../3-domain/constants/Task.js";
import { ITaskExecutor } from "../../../2-application/ports/ITaskExecutor.js"
import { assignTasks } from "../tasks/assignTasks.js"
import { createMiniCore } from "../../container/miniCore.js"
import { AppError } from '../../../5-shared/errors/index.js';

const { workerId, config } = workerData;
let sequelize = null;

// ============================================================
//  子线程入口函数
// ============================================================
async function init() {
    // 从主线程接收到的任务指令（workerData 是启动时传入，postMessage 是运行时传入）

    try {
        const core = createMiniCore(config);
        const { repositories } = core;
        sequelize = core.sequelize;

        parentPort.on('message', async (task) => {
            await runTask(task, repositories, config);
        });

        process.on('SIGTERM', async () => {
            console.log('🛑 子线程收到终止信号，正在关闭...');
            if (sequelize) {
                await sequelize.close();
                console.log(`[Worker ${workerId}] Database connection closed.`);
            }
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

/**
 * 运行任务
 * @param {*} task 
 * @param {*} repositories
 */
async function runTask(task, repositories, config) {
    const { taskId, taskfile, taskType, param } = task;
    (new AsyncLocalStorage()).run({ entryPath: taskfile }, async () => {//为子线程创建一个运行上下文，可以用于传送信息、调试等
        try {
            // console.log("收到线程任务，参数：", workerId, taskId, param);
            let result = null;
            //执行线程逻辑
            const taskExe = await assignTasks(taskType, repositories, config);
            if (!taskExe) throw new AppError(`任务类型【${taskType}】未分配到执行器！`);
            if (!taskExe instanceof ITaskExecutor) throw new AppError("线程执行逻辑需实现接口[ITaskExecutor]。");
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