import { Op } from 'sequelize';
import { ReviewString } from '../../5-shared/utils/reviewString.js';
import { SmartCharacterAnalyzer } from '../../5-shared/utils/SmartCharacterAnalyzer.js';

export class BookReviewService {
    #chapterRepository;
    #reviewRuleRepository;
    #transactionManager;

    constructor(chapterRepository, reviewRuleRepository, transactionManager) {
        this.#chapterRepository = chapterRepository;
        this.#reviewRuleRepository = reviewRuleRepository;
        this.#transactionManager = transactionManager;
    }

    /**
     * 预览校阅效果（不持久化）
     * @param {number} bookId
     * @param {number[]} chapterIds
     * @param {string} rulePattern
     * @param {string} replace
     * @returns {Promise<Array<{title, content, newText}>>}
     */
    async preview(bookId, chapterIds, rulePattern, replace) {
        const chapters = await this.#chapterRepository.findChaptersByIds(bookId, chapterIds);
        const rule = { Rule: rulePattern, Replace: replace || '' };
        return chapters.map(ch => {
            const newText = ReviewString.applyRule(rule, ch.Content);
            return {
                title: ch.Title,
                content: ch.Content,
                newText,
            };
        });
    }

    /**
     * 保存校阅结果（持久化）
     * @param {number} bookId
     * @param {string} rulePattern
     * @param {string} replace
     * @param {number[]} [chapterIds] - 若未指定则全书生效
     * @returns {Promise<Array<{id, title, updated}>>}
     */
    async save(bookId, rulePattern, replace, chapterIds = null) {
        let chapters = [];
        if (chapterIds?.length) chapters = await this.#chapterRepository.findChaptersByIds(bookId, chapterIds);
        else chapters = await this.#chapterRepository.findChaptersByBookId(bookId);
        const rule = { Rule: rulePattern, Replace: replace || '' };
        const results = [];

        await this.#transactionManager.runInTransaction(async (t) => {
            for (const ch of chapters) {
                const { match, result: newContent } = ReviewString.testRule(rule, ch.Content);
                if (newContent !== ch.Content) {
                    await this.#chapterRepository.updateChapter(
                        { id: ch.id, Content: newContent },
                        { transaction: t }
                    );
                    results.push({
                        id: ch.id, title: ch.Title, content: ch.Content,
                        newText: newContent, updateRsl: match.length,//更新命中数量
                        updated: true
                    });
                }
            }
        });

        return results;
    }

    /**
     * 可疑字符分析
     * @param {number} bookId
     * @param {number[]} [chapterIds]
     * @returns {Promise<Array<{id, title, suspiciousChars}>>}
     */
    async analyzeSuspiciousChars(bookId, chapterIds = null) {
        const chapters = await this.#chapterRepository.findChaptersByBookId(bookId);
        const filtered = chapterIds?.length
            ? chapters.filter(ch => chapterIds.includes(ch.id))
            : chapters;

        const analyzer = new SmartCharacterAnalyzer();
        return filtered.map(ch => ({
            id: ch.id,
            title: ch.Title,
            suspiciousChars: analyzer.detectSuspiciousCharacters(ch.Content || ''),
        }));
    }
}