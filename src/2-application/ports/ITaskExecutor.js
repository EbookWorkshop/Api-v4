import { TASK_TYPES } from "../constants/Task.js";
/**
 * 任务执行
 */
export class ITaskExecutor {
    /**
     * 执行任务
     * @param {TASK_TYPES} taskType 任务类型
     * @param {Object} payload - 任务参数（如 URL、bookId 等）
     * @returns {Promise<Object>} 执行结果
     */
    async execute(taskType, payload) {
        throw new Error('Method not implemented');
    }

    async close() { throw new Error('ITaskExecutor::close 尚未实现！这可能会产生内存泄漏。'); }
}