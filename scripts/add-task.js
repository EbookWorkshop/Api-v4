import fs from 'node:fs';
import path from 'node:path';
import { fileURLToPath } from 'node:url';

/**
 * 用于自动化创建一套线程任务
 * 输入任务名，在1、2、4层创建一套任务文件。
 */

const __dirname = process.env.PWD;
const oName = process.argv[2];   //对象名

if (!oName) {
    console.log("需要通过参数输入任务名。");
    process.exit();
}
const [f, ...n] = oName;
const _TaskName = f.toUpperCase() + n.join("");
const _taskName = f.toLowerCase() + n.join("");
const d2 = path.resolve(__dirname, "src/2-application");


try {
    fs.appendFileSync(path.resolve(__dirname, "src/4-infrastructure/workers/tasks/assignTasks.js"), `

console.warn("TODO:  修改安排任务执行器 //src/4-infrastructure/workers/tasks/assignTasks.js");
/*
        case TASK_TYPES.${_TaskName}_TASK_NAME:
            createTask = "${_taskName}.assembler.js";
            break;
*/`);

} catch (err) {
    console.error('写入发生其他错误: 文件-assignTasks.js', err);
}
//src/2-application/
const taskAssemblerFille = path.resolve(d2, "thread-assemblers", `${_taskName}.assembler.js`);
try {
    fs.writeFileSync(taskAssemblerFille, `
import { TASK_TYPES } from "../../3-domain/constants/Task.js";
import { ${_TaskName}Executor } from "../services/executor/${_TaskName}Executor.js";
import { ServiceServer } from "../../4-infrastructure/server/ServiceServer.js"


/**
 * 创建执行器
 * @param {Object} config 
 * @param {TASK_TYPES} taskType 
 * @param {Object} resources 
 * @returns {ITaskExecutor}
 */
export function create${_TaskName}Executor(config, taskType, resources) {
    //TODO: 为执行器注入必须的服务
    return new ${_TaskName}Executor();
}
export default create${_TaskName}Executor;
`, { flag: 'wx' });

} catch (err) {
    if (err.code === 'EEXIST') {
        console.log('文件已存在，跳过写入:', taskAssemblerFille);
    } else {
        console.error('写入发生其他错误:', taskAssemblerFille, err);
    }
}

//
const ExecutorFille = path.resolve(d2, "services/executor", `${_TaskName}Executor.js`);
try {
    fs.writeFileSync(ExecutorFille, `
import { ITaskExecutor } from '../../ports/ITaskExecutor.js';

export class ${_TaskName}Executor extends ITaskExecutor {
    #serviceServer;

    /**
     * 构造函数注入依赖（由子线程内部自行实例化）
     */
    constructor(${_taskName}eServer) {
        super();
        this.#${_taskName}Server = ${_taskName}Server;
    }

    /**
     * 执行器
     * @param {*} taskType 
     * @param {Object} payload 
     * @returns 结果
     */
    async execute(taskType, payload) {
        try {
            //TODO: 实际任务执行入口
            return true;
        } catch (error) {
            error.stack = '${_TaskName}Executor::execute: $_{import.meta.filename}\n$_{error.stack}';//TODO: 这里要改
            throw error;
        }
    }
}
export default ${_TaskName}Executor;
`, { flag: 'wx' });

} catch (err) {
    if (err.code === 'EEXIST') {
        console.log('文件已存在，跳过写入:', ExecutorFille);
    } else {
        console.error('写入发生其他错误:', ExecutorFille, err);
    }
}

try {

    fs.appendFileSync(path.resolve(__dirname, "src/2-application/services/TaskSchedulerService.js"), `
console.warn("TODO: 新增任务派发方法 // src/2-application/services/TaskSchedulerService.js")
    /*
    async submit${_TaskName}() {
        try {
            const task = new Task({
                taskType: TASK_TYPES.${_TaskName}_TASK_NAME,
                //useDB: true,
            });
            this.#workerPool.addTask(task);
            return '已添加任务：$_{task.taskId}'
        } catch (error) {
            throw new AppError("添加任务失败：" + error.message);
        }
    }

    */`);
} catch (err) {

    console.error('写入发生写入错误[TaskSchedulerService.js]:', err);
}