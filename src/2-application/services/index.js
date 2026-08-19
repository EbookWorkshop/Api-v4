import path from 'node:path';
import { BookQueryService } from './BookQueryService.js';
import { BookCommandService } from './BookCommandService.js';
import { BookDetailQueryService } from "./BookDetailQueryService.js";
import { VolumeQueryService } from './VolumeQueryService.js';
import { VolumeCommandService } from './VolumeCommandService.js';
import { ChapterQueryService } from "./ChapterQueryService.js"

import { WebBookQueryService } from "./WebBookQueryService.js"
import { WebBookDetailQueryService } from './WebBookDetailQueryService.js';

import { SystemConfigService } from "./SystemConfigService.js";
import { TagQueryService } from './TagQueryService.js';
import { FontService } from './FontService.js';
import { IFileScanner } from '../ports/IFileScanner.js';
import { FileSystemScanner } from '../../4-infrastructure/server/adapters/FileSystemScanner.js';

import { ReviewRuleQueryService } from './ReviewRuleQueryService.js';
import { ReviewRuleCommandService } from './ReviewRuleCommandService.js';
import { AssetsQueryService } from './AssetsQueryService.js';

export function createServices(repositories, config = {}) {
  const { ebookRepository, volumeRepository, indexRepository, chapterRepository } = repositories;
  const { tagRepository, systemConfigRepository, } = repositories;

  const bookDetailQueryService = new BookDetailQueryService(ebookRepository, volumeRepository, indexRepository, chapterRepository);

  // ========== 基础服务 ==========
  const systemConfigService = new SystemConfigService(systemConfigRepository);

  // ========== 字体服务（依赖 systemConfigService + 配置路径） ==========
  //TODO: 从配置中读取路径
  const fontDirPath = config?.font.path;
  const fontUrlPrefix = "/font";
  const fileScanner = new FileSystemScanner(path.join(process.cwd(), config?.repository.path));
  const fontService = new FontService(
    systemConfigService,
    fontDirPath,
    fontUrlPrefix,
    fileScanner
  );
  return {
    bookQuery: new BookQueryService(ebookRepository),
    bookDetailQuery: bookDetailQueryService,
    bookCommand: new BookCommandService(ebookRepository),
    webBookQuery: new WebBookQueryService(repositories.webBookRepository),
    webBookDetailQuery: new WebBookDetailQueryService(ebookRepository, volumeRepository, indexRepository, chapterRepository, repositories.webBookRepository),
    volumeQuery: new VolumeQueryService(volumeRepository),
    volumeCommand: new VolumeCommandService(repositories.volumeRepository),
    chapterQuery: new ChapterQueryService(chapterRepository),
    tagQuery: new TagQueryService(tagRepository),
    systemConfig: systemConfigService,
    font: fontService,

    reviewRuleQuery: new ReviewRuleQueryService(repositories.reviewRuleRepository),
    reviewRuleCommand: new ReviewRuleCommandService(repositories.reviewRuleRepository),

    assetsQuery: new AssetsQueryService(fileScanner, config),

  };
}
// console.warn("TODO： 在服务层桶文件中注册新服务 //src/2-application/services/index.js");
// /*
// import { AssetsCommandService } from './AssetsCommandService.js';
// assetsCommand: new AssetsCommandService(repositories.assetsRepository),
// */