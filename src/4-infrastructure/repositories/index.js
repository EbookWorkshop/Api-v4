import { EbookRepository } from './EbookRepository.js';
import { TagRepository } from "./TagRepository.js";
import { FontRepository } from './FontRepository.js';
import { SystemConfigRepository } from './SystemConfigRepository.js';
import { IndexRepository } from "./IndexRepository.js";
import { ChapterRepository } from "./ChapterRepository.js";
import { VolumeRepository } from "./VolumeRepository.js";
import { WebBookRepository } from './WebBookRepository.js';
import { ReviewRuleRepository } from './ReviewRuleRepository.js';


export function createRepositories(sequelize) {
  return {
    ebookRepository: new EbookRepository(sequelize),
    systemConfigRepository: new SystemConfigRepository(sequelize),
    tagRepository: new TagRepository(sequelize),
    fontRepository: new FontRepository(sequelize),

    indexRepository: new IndexRepository(sequelize),
    chapterRepository: new ChapterRepository(sequelize),
    volumeRepository: new VolumeRepository(sequelize),

    webBookRepository: new WebBookRepository(sequelize),

    reviewRuleRepository: new ReviewRuleRepository(sequelize),
  };
}