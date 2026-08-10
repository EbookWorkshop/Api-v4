import { AppError } from '../../5-shared/errors/AppError.js';

export class BookCommandService {
  #ebookRepository;
  #eventManager; // 可选，用于发送领域事件

  constructor(ebookRepository, eventManager = null) {
    this.#ebookRepository = ebookRepository;
    this.#eventManager = eventManager;
  }

  /**
   * 创建新书（命令）
   */
  async createBook(bookDTO) {
    // 1. 业务校验（如书名不能为空）
    if (!bookDTO.bookName) {
      throw new AppError('书名不能为空', 400);
    }

    // 2. 调用 Repository 持久化
    const rawData = {
      BookName: bookDTO.bookName,
      Author: bookDTO.author,
      Hotness: bookDTO.hotness || 0,
    };
    const newEntity = await this.#ebookRepository.create(rawData);

    // 3. 发送领域事件（异步解耦）
    if (this.#eventManager) {
      this.#eventManager.emit('book.created', { id: newEntity.id });
    }

    // 4. 返回 DTO
    return {
      id: newEntity.id,
      bookName: newEntity.BookName,
      author: newEntity.Author,
    };
  }

  /**
   * 更新书籍热度（命令）
   */
  async updateHotness(bookId, newHotness) {
    const entity = await this.#ebookRepository.findById(bookId);
    if (!entity) {
      throw new AppError('书籍不存在', 404);
    }

    // 业务规则：热度不能为负数
    if (newHotness < 0) newHotness = 0;

    entity.Hotness = newHotness;
    await entity.save(); // Repository 里可以封装 save 方法

    if (this.#eventManager) {
      this.#eventManager.emit('book.hotness.updated', { id: bookId, hotness: newHotness });
    }

    return { id: bookId, hotness: newHotness };
  }

  /**
   * 删除书籍（软删除或硬删除）
   */
  async deleteBook(bookId) {
    const entity = await this.#ebookRepository.findById(bookId);
    if (!entity) {
      throw new AppError('书籍不存在', 404);
    }
    await entity.destroy(); // 硬删除
    // 或者使用软删除: entity.deletedAt = new Date(); await entity.save();
  }
}