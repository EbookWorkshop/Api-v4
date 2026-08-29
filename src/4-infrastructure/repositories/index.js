import { EbookRepository } from './EbookRepository.js';
import { TagRepository } from "./TagRepository.js";
import { FontRepository } from './FontRepository.js';
import { SystemConfigRepository } from './SystemConfigRepository.js';
import { IndexRepository } from "./IndexRepository.js";
import { ChapterRepository } from "./ChapterRepository.js";
import { VolumeRepository } from "./VolumeRepository.js";
import { WebBookRepository } from './WebBookRepository.js';
import { BookmarkRepository } from './BookmarkRepository.js';
import { ReviewRuleRepository } from './ReviewRuleRepository.js';

import { RuleForWebRepository } from './RuleForWebRepository.js';
import { ReviewDictionaryRepository } from './ReviewDictionaryRepository.js';

/**
 * 仓储层工厂函数
 * @param {Sequelize} sequelize - Sequelize 实例
 * @returns {{
 *    ebookRepository:  EbookRepository,
 *    systemConfigRepository:  SystemConfigRepository,
 *    tagRepository:  TagRepository,
 *    fontRepository:  FontRepository,
 *    indexRepository:  IndexRepository,
 *    chapterRepository:  ChapterRepository,
 *    volumeRepository:  VolumeRepository,
 *    webBookRepository:  WebBookRepository,
 *    reviewRuleRepository:  ReviewRuleRepository,
 *    ruleForWebRepository:  RuleForWebRepository,
 * }}
 */
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
        bookmarkRepository: new BookmarkRepository(sequelize),

        reviewRuleRepository: new ReviewRuleRepository(sequelize),
        ruleForWebRepository: new RuleForWebRepository(sequelize),
        dictionaryRepository: new ReviewDictionaryRepository(sequelize),
    };
}
