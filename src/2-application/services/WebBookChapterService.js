// import { Op } from "sequelize";
// import { AppError } from "../../5-shared/errors/index.js";

export class WebBookChapterService {
    #transaction;
    #chapterRepository;
    #webBookChapterRepository;
    #webBookChapterURLRepository;

    constructor(transaction, chapterRepository, webBookChapterRepository, webBookChapterURLRepository) {
        this.#transaction = transaction;
        this.#chapterRepository = chapterRepository;
        this.#webBookChapterRepository = webBookChapterRepository;
        this.#webBookChapterURLRepository = webBookChapterURLRepository;

    }

    /**
     * 批量创建章节
     * @param {number} bookId 
     * @param {*} ChapterList 
     * @param {{ transaction?: import('sequelize').Transaction }} [options]
     */
    async batchCreate(bookId, ChapterList, { transaction } = {}) {
        const runTrans = async (transaction) => {
            let order = await this.#chapterRepository.getMaxOrder(bookId) + 1;

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
        }

        if (transaction) await runTrans(transaction);
        else await this.#transaction.runInTransaction(runTrans);

        return true;
    }

    /**
     * 
     * @param {*} bookId 
     * @returns {Promise<Array<{title:string,ruls:Array<string>}>>}
     */
    async findChapterWithURL(bookId) {
        return this.#webBookChapterRepository.findChapterWithURL(bookId);
    }

}