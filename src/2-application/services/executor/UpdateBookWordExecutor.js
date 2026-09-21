
import { ITaskExecutor } from '../../ports/ITaskExecutor.js';

export class UpdateBookWordExecutor extends ITaskExecutor {
    #ebookRepository;

    /**
     * 构造函数注入依赖（由子线程内部自行实例化）
     */
    constructor(ebookRepository) {
        super();
        this.#ebookRepository = ebookRepository;
    }

    async updateBookWord() {
        const bookId = await this.#ebookRepository.findBookToCalc();

    }


    /**
     * 执行器
     * @param {*} taskType 
     * @param {Object} payload 
     * @returns 结果
     */
    async execute(taskType, payload) {
        try {
            this.updateBookWord();
            return true;
        } catch (error) {
            error.stack = `UpdateBookWordExecutor::execute: ${import.meta.filename}${error.stack}`;
            throw error;
        }
    }
}
export default UpdateBookWordExecutor;
