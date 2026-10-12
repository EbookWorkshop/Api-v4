import { ITaskExecutor } from '../../../ports/ITaskExecutor.js';
import { BookExportService } from "../BookExportService.js";

export class BookExportExecutor extends ITaskExecutor {
    /** @type {BookExportService} */
    #bookExportService;
    /** @type {import('../ExportOrchestrator.js').ExportOrchestrator} */
    #orchestrator;

    /**
     * @param {BookExportService} bookExportService
     * @param {import('../ExportOrchestrator.js').ExportOrchestrator} orchestrator
     */
    constructor(bookExportService, orchestrator) {
        super();
        this.#bookExportService = bookExportService;
        this.#orchestrator = orchestrator;
    }

    async execute(taskType, payload) {
        try {
            const { bookId, format, ...setting } = payload;
            const result = await this.#bookExportService.exportBook(bookId, format, setting);
            return result;
        } catch (error) {
            error.stack = `BookExportExecutor::execute: ${import.meta.filename}\n${error.stack}`;
            throw error;
        }
    }

    async close() {
        await this.#orchestrator?.close();
    }
}

export default BookExportExecutor;