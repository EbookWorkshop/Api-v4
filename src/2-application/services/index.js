import path from 'node:path';
import { ITransaction } from "../ports/ITransaction.js"
import { BookQueryService } from './BookQueryService.js';
import { BookCommandService } from './BookCommandService.js';
import { BookDetailQueryService } from "./BookDetailQueryService.js";
import { VolumeQueryService } from './VolumeQueryService.js';
import { VolumeCommandService } from './VolumeCommandService.js';
import { ChapterQueryService } from "./ChapterQueryService.js"
import { ChapterCommandService } from './ChapterCommandService.js';
import { BookmarkService } from './BookmarkService.js';

import { WebBookQueryService } from "./WebBookQueryService.js"
import { WebBookDetailQueryService } from './WebBookDetailQueryService.js';
import { WebBookCommandService } from './WebBookCommandService.js';

import { SystemConfigService } from "./SystemConfigService.js";
import { TagQueryService } from './TagQueryService.js';
import { TagCommandService } from "./TagCommandService.js";
import { EmailService } from "./EmailService.js";
import { NodemailerEmailSender } from '../../4-infrastructure/email/NodemailerEmailSender.js';

import { FontService } from './FontService.js';
import { FileSystemScanner } from '../../4-infrastructure/server/adapters/FileSystemScanner.js';
import { FileSystemWriter } from '../../4-infrastructure/server/adapters/FileSystemWriter.js';

import { ReviewRuleQueryService } from './ReviewRuleQueryService.js';
import { ReviewRuleCommandService } from './ReviewRuleCommandService.js';

import { RuleForWebQueryService } from './RuleForWebQueryService.js';
import { RuleForWebCommandService } from './RuleForWebCommandService.js';
import { ReviewDictionaryService } from "./ReviewDictionaryService.js";
import { ReviewRuleUsingService } from './ReviewRuleUsingService.js';

import { AssetsService } from './AssetsService.js';

import { TaskSchedulerService } from "./TaskSchedulerService.js";
import { ServiceQueryService } from './ServiceQueryService.js';

/**
 * 服务层 组装所有 Service
 * @param {*} repositories 
 * @param {ITransaction} databaseTransaction 
 * @param {WorkerPool} workerPool 
 * @param {ServiceServer} svr 
 * @param {Object} config 
 * @returns 
 */
export function createServices(repositories, databaseTransaction, workerPool, svr, eventManager, config = {}) {
    const { ebookRepository, volumeRepository, indexRepository, chapterRepository } = repositories;
    const { tagRepository, systemConfigRepository, } = repositories;

    const bookDetailQueryService = new BookDetailQueryService(ebookRepository, volumeRepository, indexRepository, chapterRepository);

    // ========== 基础服务 ==========
    const systemConfigService = new SystemConfigService(systemConfigRepository);

    // ========== 字体服务（依赖 systemConfigService + 配置路径） ==========
    const fileScanner = new FileSystemScanner(path.join(process.cwd(), config?.repository.path));
    const fileWriter = new FileSystemWriter(path.join(process.cwd(), config?.repository.path));

    const fontService = new FontService(
        systemConfigService,
        fileScanner,
        fileWriter,
        config.font.path,        //字体目录路径
        '/font'
    );

    const emailSender = new NodemailerEmailSender();

    return {
        bookQuery: new BookQueryService(ebookRepository),
        bookDetailQuery: bookDetailQueryService,
        bookCommand: new BookCommandService(ebookRepository, chapterRepository, databaseTransaction),

        webBookQuery: new WebBookQueryService(repositories.webBookRepository, repositories.webBookIndexSourceURLRepository),
        webBookDetailQuery: new WebBookDetailQueryService(repositories.webBookRepository, bookDetailQueryService),
        webBookCommand: new WebBookCommandService(repositories.webBookRepository, databaseTransaction),

        volumeQuery: new VolumeQueryService(volumeRepository),
        volumeCommand: new VolumeCommandService(repositories.volumeRepository, databaseTransaction),

        chapterQuery: new ChapterQueryService(chapterRepository),
        chapterCommand: new ChapterCommandService(chapterRepository, databaseTransaction),

        tagQuery: new TagQueryService(tagRepository),
        tagCommand: new TagCommandService(tagRepository /*, databaseTransaction */),
        bookmark: new BookmarkService(repositories.bookmarkRepository),

        systemConfig: systemConfigService,
        email: new EmailService(emailSender, systemConfigService, databaseTransaction, eventManager),
        font: fontService,

        reviewRuleQuery: new ReviewRuleQueryService(repositories.reviewRuleRepository),
        reviewRuleCommand: new ReviewRuleCommandService(repositories.reviewRuleRepository/*, databaseTransaction */),
        reviewRuleUsing: new ReviewRuleUsingService(repositories.reviewRuleUsingRepository),
        ruleForWebQuery: new RuleForWebQueryService(repositories.ruleForWebRepository, systemConfigService, new ReviewDictionaryService(repositories.dictionaryRepository)),
        ruleForWebCommand: new RuleForWebCommandService(repositories.ruleForWebRepository, systemConfigService, databaseTransaction, fileScanner),

        assets: new AssetsService(fileScanner, fileWriter, config),

        task: new TaskSchedulerService(workerPool),

        serviceQuery: new ServiceQueryService(config, svr),
        // bookExport: bookExportService,
    };
}
console.warn("TODO:  在服务层桶文件中注册新服务 //src/2-application/services/index.js");
/*
import { WebBookIndexSourceURLQueryService } from './WebBookIndexSourceURLQueryService.js';
webBookIndexSourceURLQuery: new WebBookIndexSourceURLQueryService(repositories.webBookIndexSourceURLRepository),
*/
console.warn("TODO:  在服务层桶文件中注册新服务 //src/2-application/services/index.js");
/*
import { WebBookIndexSourceURLCommandService } from './WebBookIndexSourceURLCommandService.js';
webBookIndexSourceURLCommand: new WebBookIndexSourceURLCommandService(repositories.webBookIndexSourceURLRepository),
*/