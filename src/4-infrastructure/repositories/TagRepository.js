import { Op } from "sequelize";
import { UserInputError } from '../../5-shared/errors/index.js';
export class TagRepository {
    #TagModel;
    #EBookTag;

    constructor(sequelize) {
        this.#TagModel = sequelize.models.Tag;
        this.#EBookTag = sequelize.models.EBookTag;
    }

    /**
     * 
     * @param {*} includeEBookTag 【否】全部tag；【是】同时考虑是否被Ebook引用过 —— 是否join EBookTag
     * @param {*} onlyWithBook 是否仅要含书本引用的信息 —— join时，是inner 否left
     * @returns 
     */
    async #findAll(includeEBookTag = false, onlyWithBook = false) {
        const include = includeEBookTag ? [{
            model: this.#EBookTag,
            required: onlyWithBook,  // true → INNER JOIN, false → LEFT JOIN
        }] : [];
        return await this.#TagModel.findAll({ include });
    }
    /**
     * 找到所有标签，仅返回tag表的所有信息
     * @returns 
     */
    async findAllTags() { return await this.#findAll(false) }
    /**
     * 找到所有标签，并关联书本引用信息
     * @param {boolean} hasBook 标签是否返回至少有一本书引用的
     * @returns 
     */
    async findAllWithBooks(hasBook) { return await this.#findAll(true, hasBook) }

    async findTagForBook(bookId) {
        return this.#TagModel.findAll({
            include: [{
                model: this.#EBookTag,
                required: true,
                where: { BookId: { [Op.eq]: bookId } },
                attributes: [],
            }]
        })
    }

    /**
     * 创建一个标签
     * @param {object} option
     * @param {string} [option.tagText] 标签文本
     * @param {string|null|undefined} [option.color] 标签背景色
     * @param {number} [option.bookId] 直接关联书本
     * @returns [isCreateTag,isAddToBook] 是否创建标签，是否关联书籍
     */
    async createTag({ tagText, color, bookId }) {
        const [myTag] = await this.#TagModel.findOrCreate({
            where: { Text: tagText },
            defaults: {//设置Create时的默认值
                Text: tagText,
                Color: color
            }
        });

        if (bookId) {
            try {
                await this.#EBookTag.findOrCreate({
                    where: {
                        TagId: myTag.id,
                        BookId: bookId
                    }
                });
            } catch (error) {
                if (error.name === "SequelizeForeignKeyConstraintError") throw new UserInputError("关联的书籍不存在，ID：" + bookId);
                else throw error;
            }
        }
        return myTag.toJSON();
    }

    /**
     * 删除某标签
     * @param {number} tagId 要删除的标签ID
     */
    async deleteTag(tagId) {
        return await this.#TagModel.destroy({ where: { id: tagId } });
    }

    /**
     * 修改标签信息
     * @param {object} option
     * @param {number} option.tagId 标签ID
     * @param {*} option.tagText 标签文本
     * @param {*} option.color 标签颜色
     * @returns 修改行数
     */
    async updateTag({ tagId, tagText, color }) {
        const [rows] = await this.#TagModel.update({
            ...(color ? { Color: color } : {}),
            ...(tagText ? { Text: tagText } : {}),
        }, { where: { id: tagId } });
        return rows;
    }

    /**
     * 删除某书籍的标签
     * @param {*} bookId 
     * @param {*} tagId 
     * @returns 删除行数
     */
    async removeTagFromBook(bookId, tagId) {
        return await this.#EBookTag.destroy({
            where: {
                BookId: bookId,
                TagId: tagId
            }
        });
    }
}
