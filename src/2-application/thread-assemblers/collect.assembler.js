
import { CollectExecutor } from "../services/executor/CollectExecutor.js";
import { WebBookCollector } from "../services/collectors/WebBookCollector.js";
import { ChapterCollector } from "../services/collectors/ChapterCollector.js";
import { FileCollector } from "../services/collectors/FileCollector.js";
import { TASK_TYPES } from "../../3-domain/constants/Task.js";
import { AppError } from "../../5-shared/errors/index.js";


/**
 * 创建采集执行器
 * @param {Object} config 
 * @param {TASK_TYPES} taskType 
 * @param {Object} repositories 
 * @returns 
 */
export function createCollectExecutor(config, taskType, repositories) {   //TODO: 完成 WebBookCollector 基础服务的注入
    const collector = null;
    switch (taskType) {
        case TASK_TYPES.WEB_BOOK_COLLECT: collector = new WebBookCollector(config, repositories); break;
        case TASK_TYPES.WEB_BOOK_CHAPTER_COLLECT: collector = new ChapterCollector(config, repositories); break;
        case TASK_TYPES.SINGLE_CHAPTER_COLLECT: collector = new FileCollector(config, repositories); break;
        default: throw new AppError("未知的执行器任务类型：" + taskType);
    }

    return new CollectExecutor(collector);
}

export default createCollectExecutor;