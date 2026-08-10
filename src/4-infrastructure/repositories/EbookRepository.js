import { Op, where } from "sequelize";
import { IntroductionName } from '../../3-domain/constants/BookConstants.js';
export class EbookRepository {
  #EbookModel;
  #ChapterModel;
  #VolumeModel;

  constructor(sequelize) {
    this.#EbookModel = sequelize.models.Ebook;
    this.#ChapterModel = sequelize.models.EbookChapter;
    this.#VolumeModel = sequelize.models.Volume;
  }

  /**
   * 找到所有书本
   * @param {*} orderBy 排序设置，默认按热度倒序
   * @returns 
   */
  async findAll(orderBy = [['Hotness', 'DESC']]) {
    return await this.#EbookModel.findAll({ order: orderBy });
  }

  /**
   * 获取书籍信息
   * 不含简介信息
   * @param {number} id 书籍的ID
   * @param {boolean} withContent 是否返回带书籍内容的
   * @returns 
   */
  async findById(id, withContent) {
    const attr = ["createdAt", "updatedAt", "id"];
    const chapterScope = this.#ChapterModel.scope('withHasContent');
    const scopeAttrs = chapterScope.options.scopes.withHasContent.attributes.include;
    if (!withContent) attr.push('Content')
    return await this.#EbookModel.findByPk(id, {
      subQuery: false,
      include: [{
        model: chapterScope,
        as: "EbookChapter",
        attributes: {
          include: [...scopeAttrs, ["id", "IndexId"]] || [],
          exclude: attr
        },
        where: { OrderNum: { [Op.gte]: 0 } },
        order: [['OrderNum', 'ASC']]
      }, {
        model: this.#VolumeModel,
        as: "Volumes",
        attributes: { include: [["id", "VolumeId"]], exclude: ["createdAt", "updatedAt", "id"] }
      }]
    });
  }

  /**
   * 读取简介章
   * @param {*} bookid 
   */
  async findIntroduction(bookid) {
    return await this.#ChapterModel.findOne({
      where: {
        BookId: { [Op.eq]: bookid },
        Title: { [Op.eq]: IntroductionName }
      },
      attributes: ["Content"]
    });
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
