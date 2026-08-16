import path from 'node:path';
import { BookQueryService } from './BookQueryService.js';
import { BookCommandService } from './BookCommandService.js';
import { BookDetailQueryService } from "./BookDetailQueryService.js";
import { VolumeQueryService } from './VolumeQueryService.js';
import { ChapterQueryService } from "./ChapterQueryService.js"

import { WebBookQueryService } from "./WebBookQueryService.js"
import { WebBookDetailQueryService } from './WebBookDetailQueryService.js';

import { SystemConfigService } from "./SystemConfigService.js";
import { TagQueryService } from './TagQueryService.js';
import { FontService } from './FontService.js';

export function createServices(repositories, config = {}) {
  const { ebookRepository, volumeRepository, indexRepository, chapterRepository } = repositories;
  const { tagRepository, systemConfigRepository, } = repositories;

  const bookDetailQueryService = new BookDetailQueryService(ebookRepository, volumeRepository, indexRepository, chapterRepository);

  // ========== 基础服务 ==========
  const systemConfigService = new SystemConfigService(systemConfigRepository);

  // ========== 字体服务（依赖 systemConfigService + 配置路径） ==========
  //TODO: 从配置中读取路径
  const fontDirPath = path.join(process.cwd(), config?.repository‌.path, config?.font.path);
  const fontUrlPrefix = "/font";

  const fontService = new FontService(
    systemConfigService,
    fontDirPath,
    fontUrlPrefix
  );
  return {
    bookQuery: new BookQueryService(ebookRepository),
    bookDetailQuery: bookDetailQueryService,
    bookCommand: new BookCommandService(ebookRepository),
    webBookQuery: new WebBookQueryService(repositories.webBookRepository),
    webBookDetailQuery: new WebBookDetailQueryService(ebookRepository, volumeRepository, indexRepository, chapterRepository, repositories.webBookRepository),
    volumeQuery: new VolumeQueryService(volumeRepository),
    chapterQuery: new ChapterQueryService(chapterRepository),
    tagQuery: new TagQueryService(tagRepository),
    systemConfig: systemConfigService,
    font: fontService,
  };
}
