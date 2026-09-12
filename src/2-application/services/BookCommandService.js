import { EbookRepository } from "../../4-infrastructure/repositories/EbookRepository.js"
import { ChapterRepository } from "../../4-infrastructure/repositories/ChapterRepository.js"
import { ITransaction } from "../ports/ITransaction.js"
import { AppError, UserInputError } from '../../5-shared/errors/index.js';

export class BookCommandService {
    /** @type {EbookRepository} */
    #ebookRepository;
    /** @type {ChapterRepository} */
    #chapterRepository;
    /** @type {ITransaction} */
    #transaction;
    #coverService;

    /**
     * @param {EbookRepository} ebookRepository 
     * @param {ChapterRepository} chapterRepository 
     * @param {ITransaction} transaction 
     */
    constructor(ebookRepository, chapterRepository, transaction, coverService) {
        this.#ebookRepository = ebookRepository;
        this.#chapterRepository = chapterRepository;
        this.#transaction = transaction;
        this.#coverService = coverService;
    }

    /**
     * 创建一本空书
     * @param {*} bookName 
     * @param {*} author 
     * @returns 
     */
    async createEmptyBook({ bookName, author }) {
        const rawData = {
            BookName: bookName,
            Author: author,
            CoverImg: "#212f30",
            Hotness: 0,
        };
        return this.#ebookRepository.create(rawData);
    }

    /**
     * 添加创建书本
     * @param {*} bookDTO 书本信息
     * @param {*} chaptersDTO 章节信息
     */
    async createBook(bookDTO, chaptersDTO) {
        let result = null;
        await this.#transaction.runInTransaction(async (transaction) => {
            const newBook = await this.#ebookRepository.create({
                BookName: bookDTO.bookName,
                Author: bookDTO.author,
                CoverImg: bookDTO.cover,
                Hotness: 0,
            }, { transaction });

            const chapters = {
                bookId: newBook.id,
                //volumeId:-1,      //TODO: 插入时兼容分卷
                chapters: chaptersDTO,
            }

            await this.#chapterRepository.batchInsertChapters(chapters, { transaction });
            result = newBook.toJSON();
        });
        return result;
    }

    /**
     * 更新书籍热度（命令）
     */
    async updateBookHeat(bookId) {
        let result = await this.#ebookRepository.increment(bookId);
        if (!result) throw new AppError('书籍不存在', 404);
        return true;
    }

    /**
     * 删除书籍（软删除或硬删除）
     */
    async deleteBook(bookId) {
        //TODO: 删除封面-删除书本信息前需要删除封面
        return this.#ebookRepository.delete(bookId);
    }

    /**
     * 修改书籍元数据
     * @param {number} id 修改的书籍ID
     * @param {*} metadata 
     */
    async updateMetadata(id, metadata) {
        const oldBookInfo = await this.#ebookRepository.findById(id);
        let updateCover = null;

        const result = await this.#transaction.runInTransaction(async (transaction) => {
            const { Introduction, converFile, coverShowName, embelBookName, ...data } = metadata;
            if (Introduction) await this.#chapterRepository.updateIntroduction({ bookId: id, content: Introduction }, { transaction });

            if (converFile) {
                data.CoverImg = await this.#coverService.saveCoverAndGetFilePath(converFile, coverShowName, embelBookName);
            }

            updateCover = data.CoverImg;
            return this.#ebookRepository.updateMetadata(id, data, { transaction });
        });

        await this.#coverService.deleteCoverFile(oldBookInfo.CoverImg, { except: updateCover });

        return result;
    }
}
