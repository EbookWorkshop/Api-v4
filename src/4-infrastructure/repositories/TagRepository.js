import { Op } from "sequelize";
import { AppError } from '../../5-shared/errors/AppError.js';
export class TagRepository {
    #TagModel;
    #EBookTag;

    constructor(sequelize) {
        this.#TagModel = sequelize.models.Tag;
        this.#EBookTag = sequelize.models.EBookTag;
    }

    /**
     * 
     * @param {*} includeEBookTag 是否包含被EBook引用的数据
     * @param {*} onlyWithBook 是否仅要含书本引用的信息
     * @returns 
     */
    async findAll(includeEBookTag = false, onlyWithBook = false) {
        const include = includeEBookTag ? [{
            model: this.#EBookTag,
            required: onlyWithBook,  // true → INNER JOIN, false → LEFT JOIN
        }] : [];
        return await this.#TagModel.findAll({ include });
    }

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
     * @param {string} tagText 标签文本
     * @param {string|null|undefined} color 标签背景色
     * @param {number} bookId 直接关联书本
     * @returns [isCreateTag,isAddToBook] 是否创建标签，是否关联书籍
     */
    async createTag(tagText, color, bookId) {
        const [myTag, isCreate] = await this.#TagModel.findOrCreate({
            where: { Text: tagText }
        });

        if (isCreate) {//因为color允许为空，非新建模式下不修改避免覆盖原有颜色设置
            myTag.Color = color;
            myTag.save();
        }
        let addToBook = false;

        if (bookId) {
            try {
                let _;
                [_, addToBook] = await this.#EBookTag.findOrCreate({
                    where: {
                        TagId: myTag.id,
                        BookId: bookId
                    }
                });
            } catch (error) {
                if (error.name === "SequelizeForeignKeyConstraintError") throw new AppError("关联的书籍不存在，ID：" + bookId, 600);
                else throw error;
            }
        }
        return [isCreate, addToBook];
    }

    /**
     * 删除某标签
     * @param {number} tagId 要删除的标签ID
     */
    async deleteTag(tagId) {
        return await this.#TagModel.destroy({ where: { id: tagId } });
    }

    getModel() {
        return this.#TagModel;
    }
}
