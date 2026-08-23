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
    try {
      const transaction = await this.#transaction.begin();
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
      await this.#transaction.commit();
      return newBook.toJSON();
    } catch (error) {
      await this.#transaction.rollback();
      throw error;
    }
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
}