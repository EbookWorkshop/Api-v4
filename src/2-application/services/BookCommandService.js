import { EbookRepository } from "../../4-infrastructure/repositories/EbookRepository.js"
import { ChapterRepository } from "../../4-infrastructure/repositories/ChapterRepository.js"
import { ITransaction } from "../ports/ITransaction.js"
import { AppError, UserInputError } from '../../5-shared/errors/index.js';

export class BookCommandService {
  #ebookRepository;
  #chapterRepository;
  #transaction;

  /**
   * 
   * @param {EbookRepository} ebookRepository 
   * @param {ChapterRepository} chapterRepository 
   * @param {ITransaction} transaction 
   */
  constructor(ebookRepository, chapterRepository, transaction) {
    this.#ebookRepository = ebookRepository;
    this.#chapterRepository = chapterRepository;
    this.#transaction = transaction;
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
        //volumeId:-1,      //TODO：插入时兼容分卷
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
    return this.#ebookRepository.delete(bookId);
  }

  /**
   * 修改书籍元数据
   * @param {number} id 修改的书籍ID
   * @param {*} metadata 
   */
  async updateMetadata(id, metadata) {
    return await this.#transaction.runInTransaction(async (transaction) => {
      const { Introduction, ...data } = metadata;
      if (Introduction) await this.#chapterRepository.updateIntroduction({ bookId: id, content: Introduction }, { transaction });

      if (metadata.converFile || typeof (metadata.CoverImg) !== "undefined") {
        //TODO: 如果是文件，保存到服务器、并设置 data.CoverImg
        console.warn("TODO: 如果是文件，保存到服务器、并设置 metadata.CoverImg")
      }

      return this.#ebookRepository.updateMetadata(id, data, { transaction });
    })
  }
}