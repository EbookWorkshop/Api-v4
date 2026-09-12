import { EbookRepository } from './EbookRepository.js';
import { TagRepository } from "./TagRepository.js";
import { FontRepository } from './FontRepository.js';
import { SystemConfigRepository } from './SystemConfigRepository.js';
import { IndexRepository } from "./IndexRepository.js";
import { ChapterRepository } from "./ChapterRepository.js";
import { VolumeRepository } from "./VolumeRepository.js";
import { WebBookRepository } from './WebBookRepository.js';
import { WebBookChapterRepository } from './WebBookChapterRepository.js';
import { WebBookSourceURLRepository } from './WebBookSourceURLRepository.js';
import { WebBookChapterURLRepository } from './WebBookChapterURLRepository.js';
import { BookmarkRepository } from './BookmarkRepository.js';
import { ReviewRuleRepository } from './ReviewRuleRepository.js';

import { RuleForWebRepository } from './RuleForWebRepository.js';
import { ReviewRuleUsingRepository } from './ReviewRuleUsingRepository.js';
import { ReviewDictionaryRepository } from './ReviewDictionaryRepository.js';


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
        webBookChapterRepository: new WebBookChapterRepository(sequelize),
        webBookSourceURLRepository: new WebBookSourceURLRepository(sequelize),
        webBookChapterURLRepository: new WebBookChapterURLRepository(sequelize),
        bookmarkRepository: new BookmarkRepository(sequelize),

        reviewRuleRepository: new ReviewRuleRepository(sequelize),
        ruleForWebRepository: new RuleForWebRepository(sequelize),
        dictionaryRepository: new ReviewDictionaryRepository(sequelize),
        reviewRuleUsingRepository: new ReviewRuleUsingRepository(sequelize),

        sequelize,
    };
}