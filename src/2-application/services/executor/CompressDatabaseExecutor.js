import { ITaskExecutor } from '../../ports/ITaskExecutor.js';


export class CompressDatabaseExecutor extends ITaskExecutor {
    #sequelize;

    /**
     * 构造函数注入依赖（由子线程内部自行实例化）
     */
    constructor(sequelize) {
        super();
        this.#sequelize = sequelize;
    }

    /**
     * 执行器
     * @param {*} taskType 
     * @param {Object} payload 
     * @returns 结果
     */
    async execute(taskType, payload) {
        try {
            await this.#sequelize.query('VACUUM;');
            return true;
        } catch (error) {
            error.stack = `CompressDatabaseExecutor::execute: ${import.meta.filename}\n${error.stack}`;
            throw error;
        }
    }
}
export default CompressDatabaseExecutor;