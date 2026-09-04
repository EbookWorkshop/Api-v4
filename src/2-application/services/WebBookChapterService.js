import { AppError } from "../../5-shared/errors/index.js"

export class WebBookChapterService {

    /** @type {ITransaction} */
    #transaction;


    /** @type {ChapterRepository} */
    #chapterRepository;
    #webBookChapterRepository;
    #webBookChapterURLRepository;

    /**
     * @param {WebBookRepository} webBookRepository 
     */
    constructor(transaction, chapterRepository, webBookChapterRepository, webBookChapterURLRepository) {
        this.#transaction = transaction;
        this.#chapterRepository = chapterRepository;
        this.#webBookChapterRepository = webBookChapterRepository;
        this.#webBookChapterURLRepository = webBookChapterURLRepository;

    }

    /**
     * 批量创建章节
     * @param {*} ChapterList 
     * @param {*} param1 
     */
    async batchCreate(bookId, ChapterList, { transaction } = {}) {
        let order = 1;
        const chapAll = ChapterList.map((c => ({ Title: c.text, OrderNum: order++, WebTitle: c.text, Path: c.url })));

        let tempDTO = chapAll.map(({ Title, OrderNum }) => ({ Title, OrderNum }));
        await this.#chapterRepository.batchInsertChapters({ bookId, chapters: tempDTO }, { transaction });

        let orderOfId = await this.#chapterRepository.findIdOrderByBookId(bookId, { transaction });
        tempDTO = chapAll.map(c => {
            return {
                WebTitle: c.WebTitle,
                IndexId: orderOfId.find(o => o.OrderNum === c.OrderNum).id,
            }
        });
        await this.#webBookChapterRepository.batchInsertChapters({ chapters: tempDTO }, { transaction });

        orderOfId = await this.#webBookChapterRepository.findIdOrderByBookId(bookId, { transaction });
        tempDTO = chapAll.map(c => {
            return {
                Path: c.Path, WebBookChapterId: orderOfId.find(o => o["EbookChapter.OrderNum"] === c.OrderNum)?.id
            }
        });
        await this.#webBookChapterURLRepository.batchInsert({ chapterURLs: tempDTO }, { transaction });

        return true;
    }
}