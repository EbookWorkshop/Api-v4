import { AppError } from "../../5-shared/errors/index.js";
import { READING_HABIT } from "../constants/SystemConfigGroup.js";
import { countWords, countParagraphs, estimateMinutes } from "../../3-domain/services/TextStatistics.js";

export class BookAnalysisService {
    #chapterRepository;
    #ebookRepository;
    #systemConfigService;
    // #transaction;
    constructor(ebookRepository, chapterRepository, systemConfigService, transaction) {
        this.#ebookRepository = ebookRepository;
        this.#chapterRepository = chapterRepository;
        this.#systemConfigService = systemConfigService;
        // this.#transaction = transaction;
    }

    /**
     * 重新统计书籍文本规模并回写 TotalWord
     * @param {number} bookId
     */
    async analyze(bookId) {
        const [chapters, emptyCount, wpmCfg] = await Promise.all([
            this.#chapterRepository.findChaptersForStats(bookId),
            this.#chapterRepository.countEmptyChapters(bookId),
            this.#systemConfigService.getConfig(READING_HABIT, 'speed_words_per_minute'),
        ]);

        if (!chapters.length) throw new AppError('书籍没有章节或章节内容为空', 404);

        const WPM = Number(wpmCfg) || 250;

        let totalWords = 0;
        let totalParagraphs = 0;
        const chapterResults = [];

        for (const ch of chapters) {
            const words = countWords(ch.Content);
            const paragraphs = countParagraphs(ch.Content);

            totalWords += words;
            totalParagraphs += paragraphs;

            chapterResults.push({
                chapterId: ch.id,
                chapterTitle: ch.Title,
                paragraphs,
                words,
                readingTime: estimateMinutes(words, WPM),
            });
        }

        await this.#ebookRepository.updateMetadata(bookId, { TotalWord: totalWords });

        return {
            totalChapters: chapters.length + emptyCount,
            emptyChapters: emptyCount,
            totalWords,
            totalParagraphs,
            readingTime: estimateMinutes(totalWords, WPM),
            wpm: WPM,
            avgWordsPerChapter: (totalWords / chapters.length).toFixed(2),
            avgParagraphsPerChapter: (totalParagraphs / chapters.length).toFixed(2),
            chapters: chapterResults,
        };
    }
}