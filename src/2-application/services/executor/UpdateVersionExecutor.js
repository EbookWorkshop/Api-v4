import { ITaskExecutor } from '../../ports/ITaskExecutor.js';


export class UpdateVersionExecutor extends ITaskExecutor {
    #serviceServer;

    /**
     * 构造函数注入依赖（由子线程内部自行实例化）
     */
    constructor(serviceServer) {
        super();
        this.#serviceServer = serviceServer;
    }

    /**
     * 执行器
     * @param {*} taskType 
     * @param {Object} payload 
     * @returns 结果
     */
    async execute(taskType, payload) {
        try {
            await this.#serviceServer.updateVersionInfo();
            return true;
        } catch (error) {
            error.stack = `UpdateVersionExecutor::execute: ${import.meta.filename}\n${error.stack}`;
            throw error;
        }
    }
}
export default UpdateVersionExecutor;