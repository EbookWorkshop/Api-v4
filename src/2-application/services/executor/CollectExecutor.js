import { ITaskExecutor } from '../../ports/ITaskExecutor.js';
import { TASK_TYPES } from '../../../3-domain/constants/Task.js';

export class CollectExecutor extends ITaskExecutor {
    constructor(collector) {
        super();
        this.collector = collector;
    }

    async execute(taskType, payload) {
        try {
            switch (taskType) {
                case TASK_TYPES.WEB_BOOK_COLLECT:
                // return await this.collector.collectBook(payload.sourcePage, payload.infoPage, payload);
                case TASK_TYPES.SINGLE_CHAPTER_COLLECT:
                // return await this.collector.collectSingleChapter(payload.url, payload);
                case TASK_TYPES.WEB_BOOK_CHAPTER_COLLECT:
                // return await this.collector.collectChapter(payload.chapterId, payload);
                default:
                    throw new Error('未知任务类型！');
            }
            // return await this.collector(play)
        } catch (error) {
            error.stack = `CollectExecutor::execute: ${import.meta.filename}\n${error.stack}`;
            throw error;
        }
    }
}