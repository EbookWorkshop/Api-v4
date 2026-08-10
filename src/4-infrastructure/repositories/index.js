import { EbookRepository } from './EbookRepository.js';
import { TagRepository } from "./TagRepository.js";
import { FontRepository } from './FontRepository.js';
import { SystemConfigRepository } from './SystemConfigRepository.js';

export function createRepositories(sequelize) {
  return {
    ebookRepository: new EbookRepository(sequelize),
    systemConfigRepository: new SystemConfigRepository(sequelize),
    tagRepository: new TagRepository(sequelize),
    fontRepository: new FontRepository(sequelize),
  };
}