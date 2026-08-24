import path from 'node:path';
import { ITransaction } from "../ports/ITransaction.js"
import { BookQueryService } from './BookQueryService.js';
import { BookCommandService } from './BookCommandService.js';
import { BookDetailQueryService } from "./BookDetailQueryService.js";
import { VolumeQueryService } from './VolumeQueryService.js';
import { VolumeCommandService } from './VolumeCommandService.js';
import { ChapterQueryService } from "./ChapterQueryService.js"
import { ChapterCommandService } from './ChapterCommandService.js';

import { WebBookQueryService } from "./WebBookQueryService.js"
import { WebBookDetailQueryService } from './WebBookDetailQueryService.js';

import { SystemConfigService } from "./SystemConfigService.js";
import { TagQueryService } from './TagQueryService.js';
import { TagCommandService } from "./TagCommandService.js";
import { EmailService } from "./EmailService.js";

import { FontService } from './FontService.js';
import { FileSystemScanner } from '../../4-infrastructure/server/adapters/FileSystemScanner.js';

import { ReviewRuleQueryService } from './ReviewRuleQueryService.js';
import { ReviewRuleCommandService } from './ReviewRuleCommandService.js';

import { RuleForWebQueryService } from './RuleForWebQueryService.js';

import { AssetsQueryService } from './AssetsQueryService.js';


//导出工具
import { BookExportService } from './BookExportService.js';
import { GeneratorFactory } from '../../4-infrastructure/server/generators/GeneratorFactory.js';

/**
 * 服务层 组装所有 Service
 * @param {*} repositories 
 * @param {ITransaction} databaseTransaction 
 * @param {Object} config 
 * @returns 
 */
export function createServices(repositories, databaseTransaction, config = {}) {
  const { ebookRepository, volumeRepository, indexRepository, chapterRepository } = repositories;
  const { tagRepository, systemConfigRepository, } = repositories;

  const bookDetailQueryService = new BookDetailQueryService(ebookRepository, volumeRepository, indexRepository, chapterRepository);

  // ========== 基础服务 ==========
  const systemConfigService = new SystemConfigService(systemConfigRepository);

  // ========== 字体服务（依赖 systemConfigService + 配置路径） ==========
  const fontDirPath = config?.font.path;
  const fontUrlPrefix = "/font";
  const fileScanner = new FileSystemScanner(path.join(process.cwd(), config?.repository.path));
  const fontService = new FontService(
    systemConfigService,
    fontDirPath,
    fontUrlPrefix,
    fileScanner
  );

  //创建导出工具
  const generatorFactory = new GeneratorFactory(config.export?.tempDir);
  const bookExportService = new BookExportService(ebookRepository, generatorFactory);

  return {
    bookQuery: new BookQueryService(ebookRepository),
    bookDetailQuery: bookDetailQueryService,
    bookCommand: new BookCommandService(ebookRepository, chapterRepository, databaseTransaction),

    webBookQuery: new WebBookQueryService(repositories.webBookRepository),
    webBookDetailQuery: new WebBookDetailQueryService(repositories.webBookRepository, bookDetailQueryService),

    volumeQuery: new VolumeQueryService(volumeRepository),
    volumeCommand: new VolumeCommandService(repositories.volumeRepository, databaseTransaction),

    chapterQuery: new ChapterQueryService(chapterRepository),
    chapterCommand: new ChapterCommandService(chapterRepository, databaseTransaction),

    tagQuery: new TagQueryService(tagRepository),
    tagCommand: new TagCommandService(tagRepository,databaseTransaction),

    systemConfig: systemConfigService,
    email: new EmailService(systemConfigService),
    font: fontService,

    reviewRuleQuery: new ReviewRuleQueryService(repositories.reviewRuleRepository),
    reviewRuleCommand: new ReviewRuleCommandService(repositories.reviewRuleRepository,databaseTransaction),

    ruleForWebQuery: new RuleForWebQueryService(repositories.ruleForWebRepository),

    assetsQuery: new AssetsQueryService(fileScanner, config),

    bookExport: new BookExportService(bookDetailQueryService, generatorFactory),
  };
}
// console.warn("TODO： 在服务层桶文件中注册新服务 //src/2-application/services/index.js");
// /*
// import { AssetsCommandService } from './AssetsCommandService.js';
// assetsCommand: new AssetsCommandService(repositories.assetsRepository),
// */

/*
import { RuleForWebCommandService } from './RuleForWebCommandService.js';
ruleForWebCommand: new RuleForWebCommandService(repositories.ruleForWebRepository),
*/
