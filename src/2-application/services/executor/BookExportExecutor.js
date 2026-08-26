import { ITaskExecutor } from '../../ports/ITaskExecutor.js';
import { BookExportService } from "../BookExportService.js"


export class BookExportExecutor extends ITaskExecutor {
    /** @type {BookExportService}  */
    #bookExportService;

    /**
     * 构造函数注入依赖（由子线程内部自行实例化）
     */
    constructor(bookExportService) {
        super();
        this.#bookExportService = bookExportService;
    }

    /**
     * 执行器
     * @param {*} taskType 
     * @param {Object} payload 
     * @returns {{ path, filename }} 导出结果
     */
    async execute(taskType, payload) {
        try {
            //执行
            const { bookId, format, ...setting } = payload;
            const result = await this.#bookExportService.exportBook(bookId, format, setting);
            return result;
        } catch (error) {

        }
    }
}
export default BookExportExecutor;