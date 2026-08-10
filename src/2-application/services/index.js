import path from 'node:path';
import { BookQueryService } from './BookQueryService.js';
import { BookCommandService } from './BookCommandService.js';
import { SystemConfigService } from "./SystemConfigService.js";
import { TagQueryService } from './TagQueryService.js';
import { FontService } from './FontService.js';

export function createServices(repositories, config = {}) {
  const { ebookRepository, tagRepository, systemConfigRepository } = repositories;

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
    bookCommand: new BookCommandService(ebookRepository),
    tagQuery: new TagQueryService(tagRepository),
    systemConfig: systemConfigService,
    font: fontService,
  };
}
