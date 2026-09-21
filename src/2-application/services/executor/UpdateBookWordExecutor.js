
import { ITaskExecutor } from '../../ports/ITaskExecutor.js';

export class UpdateBookWordExecutor extends ITaskExecutor {
    #ebookRepository;
    #bookAnalysis;

    /**
     * 构造函数注入依赖（由子线程内部自行实例化）
     */
    constructor(ebookRepository, bookAnalysis) {
        super();
        this.#ebookRepository = ebookRepository;
        this.#bookAnalysis = bookAnalysis;
    }

    async updateBookWord() {
        const bookId = await this.#ebookRepository.findBookToCalc();
        console.warn(`对书籍进行了字数统计：${bookId}`);
        return this.#bookAnalysis.analyze(bookId);
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
    async close() {

    }
}
export default UpdateBookWordExecutor;
