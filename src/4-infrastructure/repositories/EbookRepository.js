import { Op } from "sequelize";
export class EbookRepository {
  #EbookModel;
  #EBookTagModel;

  constructor(sequelize) {
    this.#EbookModel = sequelize.models.Ebook;
    this.#EBookTagModel = sequelize.models.EBookTag;
  }

  /**
   * 找到所有书本
   * @param {*} orderBy 排序设置，默认按热度倒序
   * @returns  JSON 格式的书籍列表
   */
  async findAll(orderBy = [['Hotness', 'DESC']]) {
    return await this.#EbookModel.findAll({ order: orderBy, attributes: { include: [["id", "BookId"]] }, raw: true });
  }

  /**
   * 通用的书籍查询方法（支持标签过滤）
   * 已支持分页
   * @param {Object} options
   * @param {number} options.tagId - 包含的标签ID（大于0时生效）
   * @param {number[]} options.excludeTagIds - 排除的标签ID列表
   * @param {Array<[string, string]>} options.orderBy - 排序规则
   * @param {number} options.limit - 分页限制
   * @param {number} options.offset - 分页偏移
   * @returns {Promise<Object[]>} 纯对象数组
   */
  async findAllWithTagFilter(options = {}) {
    const {
      tagId = 0,
      excludeTagIds = [],
      orderBy = [['Hotness', 'DESC'], ['id', 'DESC']],
      limit,
      offset,
    } = options;

    // 如果没有排除标签，直接走联查
    if (excludeTagIds.length === 0) {
      const include = tagId > 0 ? [{
        model: this.#EBookTagModel,
        required: true,
        where: { TagId: tagId },
        attributes: [],//仅要求关联关系，不需要tag相关任何数据
      }] : [];

      const books = await this.#EbookModel.findAll({
        where: { id: { [Op.ne]: null } }, // 占位，保持 where 结构统一
        include,
        order: orderBy,
        limit,
        offset,
      });

      return books.map(book => book.toJSON());
    }

    // 有排除标签：先查出被排除的 BookId
    const excludedBookIds = await this.#EBookTagModel.findAll({
      where: { TagId: { [Op.in]: excludeTagIds } },
      attributes: ['BookId'],
      raw: true, // 直接返回纯对象
    });

    const excludedIdSet = new Set(excludedBookIds.map(item => item.BookId));

    // 构建主查询条件
    const where = {
      id: { [Op.notIn]: Array.from(excludedIdSet) },
    };

    // 如果同时有包含标签，需要做交集
    let include = [];
    if (tagId > 0) {
      // 方案 A：用子查询取交集（性能较好）
      const includedBookIds = await this.#EBookTagModel.findAll({
        where: { TagId: tagId },
        attributes: ['BookId'],
        raw: true,
      });
      const includedIdSet = new Set(includedBookIds.map(item => item.BookId));
      // 交集运算：在排除后的基础上，只保留包含的
      const finalIdSet = new Set(
        Array.from(includedIdSet).filter(id => !excludedIdSet.has(id))
      );
      if (finalIdSet.size === 0) {
        return []; // 没有交集，直接返回空
      }
      where.id = { [Op.in]: Array.from(finalIdSet) };
    }

    const books = await this.#EbookModel.findAll({
      where,
      include,
      order: orderBy,
      limit,
      offset,
    });

    return books.map(book => book.toJSON());
  }

  /**
   * 找到具体的书
   * @param {*} bookId 书籍ID
   * @returns JSON 格式的书籍信息
   */
  async findById(bookId) {
    return await this.#EbookModel.findByPk(bookId, { raw: true });
  }

  /**
   * 为指定字段加1
   * 原子性地增加数值（能避免并发导致数据覆盖丢失问题）
   * @param {*} bookId 
   * @param {String|Array|Object} [fields='Hotness'] 字符串：'age'，默认增加 1。
   * 数组：['age', 'score']，所有字段默认增加 1。
   * 对象：{ age: 2, score: 5 }，为不同字段指定不同的增加量。
   * @param {Number} [delta=1] 步长
   * @returns 是否更新成功（更新行数大于1）
   */
  async increment(bookId, fields = 'Hotness', delta = 1) {
    const affectedRows = await this.#EbookModel.increment(fields, {
      by: delta,
      where: { id: bookId },
    });//返回所有涉及的行数，以及是否更新成功（可以用于分辨部分失败的情况）
    return affectedRows.length > 0;
  }

  // async create(data) {
  //   return await this.#EbookModel.create(data);
  // }

  // async bulkCreate(books) {
  //   return await this.#EbookModel.bulkCreate(books);
  // }

  getModel() {
    return this.#EbookModel;
  }
}
