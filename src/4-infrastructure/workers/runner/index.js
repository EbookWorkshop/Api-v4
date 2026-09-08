//带数据库的线程，可使用数据库的线程

import { parentPort, workerData } from 'worker_threads';
import { TASK_TYPES, TASK_MESSAGE_TYPE as TMT } from "../../../2-application/constants/Task.js";
import { assignTasks } from "../tasks/assignTasks.js"
import { AppError } from '../../../5-shared/errors/index.js';

const { workerId, config } = workerData;
let beforeClose = () => { console.log('🛑 未定义子线程退出程序。'); }
let isrunning = false;

// ============================================================
//  子线程入口函数
// ============================================================
/**
 * 初始化线程
 * @param {*} serverResources 系统资源（由各执行器自行定制），资源将在运行任务时，传递到各个任务
 * @param {*} onclose 关闭回调，用于清理回收资源
 */
export async function initWorker(serverResources, onclose = () => { }) {
    // 从主线程接收到的任务指令（workerData 是启动时传入，postMessage 是运行时传入）
    try {
        beforeClose = onclose ?? beforeClose;
        parentPort.on('message', async (task) => {
            if (task.taskType == TASK_TYPES.COMMAND) return await runCommand(task.param, config, serverResources);
            await runTask(task, config, serverResources);
        });
    } catch (error) {
        throwError(error);
    }
}

/**
 * 
 * @param {{cmd:string}} cmd 
 * @param {*} config 
 * @param {*} resources 
 * @returns 
 */
async function runCommand(cmd, config, resources) {
    switch (cmd.cmd) {
        case "shutdown": return await closeMe();
        default: console.log("尚未开发的子线程命令：", cmd); break
    }
}

/**
 * 运行任务
 * @param {*} task 
 * @param {*} resources 线程资源
 */
async function runTask(task, config, resources) {
    const { taskId, taskType, param } = task;
    // (new AsyncLocalStorage()).run({ taskId }, async () => {//为子线程创建一个运行上下文，可以用于传送信息、调试等。取回： new AsyncLocalStorage().getStore()?.taskId
    try {
        isrunning = true;
        let result = null;
        //执行线程逻辑
        const taskExe = await assignTasks(taskType, config, resources);
        if (!taskExe) throw new AppError(`任务类型【${taskType}】未分配到执行器！`);
        result = await taskExe.execute(taskType, param);

        parentPort.postMessage({
            type: TMT.TASK_COMPLETED,
            taskId,
            workerId,
            data: result,
        });
        await taskExe.close();
    } catch (error) {
        throwError(error, taskId, param);
    } finally {
        isrunning = false;
    }
    // });
}

function throwError(error, taskId, data) {
    const errorPayload = {
        type: TMT.TASK_ERROR,
        workerId,
        taskId,
        error: {
            message: error.message,
            stack: error.stack,
            code: error.code || 'UNKNOWN',
            data,
        },
    };
    parentPort.postMessage(errorPayload);
}

async function closeMe() {
    console.assert(!isrunning, "警告：正在尝试关闭一个正在执行任务中的线程！");
    await beforeClose?.();
    process.exit(0);
}