import { Op } from "sequelize";
export class ReviewRuleUsingRepository {
    #ReviewRuleUsingModel;
    #ReviewRuleModel;
    #EbookModel;

    constructor(sequelize) {
        this.#ReviewRuleUsingModel = sequelize.models.ReviewRuleUsing;
        this.#ReviewRuleModel = sequelize.models.ReviewRule;
        this.#EbookModel = sequelize.models.Ebook;

    }

    /**
     * 
     * @param {number|undefined} bookId 
     * @returns 
     */
    async findAll(bookId) {
        const rules = await this.#ReviewRuleUsingModel.findAll({
            where: bookId ? ({ BookId: bookId }) : (undefined),
            include: [{
                model: this.#EbookModel,// as: "Ebook",
                attributes: ["BookName", "id"]
            }, {
                model: this.#ReviewRuleModel, //as: "ReviewRule",
                attributes: ["Name", "id"],
            }],
            order: [["updatedAt", "DESC"], ["BookId", "ASC"]]
        });
        return rules?.map(item => ({
            id: item.id,
            bookId: item.Ebook?.id,
            bookName: item.Ebook?.BookName,
            ruleId: item.ReviewRule.id,
            ruleName: item.ReviewRule.Name
        })) || [];
    }

    async create(bookId, ruleId) {
        let whereParam = { BookId: bookId, RuleId: ruleId };
        let [rule, created] = await this.#ReviewRuleUsingModel.findOrCreate({
            where: whereParam,
            defaults: {
                BookId: bookId,
                RuleId: ruleId,
            }
        });

        return created;
    }

    async delete(id) {
        return this.#ReviewRuleUsingModel.destroy({
            where: { id: id }
        });
    }
}