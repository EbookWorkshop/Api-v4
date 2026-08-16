import { Op, literal } from "sequelize";
export class ReviewRuleRepository {
    #ReviewRuleModel;
    #ReviewRuleUsingModel;

    constructor(sequelize) {
        this.#ReviewRuleModel = sequelize.models.ReviewRule;
        this.#ReviewRuleUsingModel = sequelize.models.ReviewRuleUsing;
    }

    /**
     * 找到所有校阅规则
     * @returns 
     */
    async findAll(order = [["updatedAt", "DESC"]]) {
        return await this.#ReviewRuleModel.findAll({
            attributes: {
                exclude: ["createdAt", "updatedAt"],
                include: [
                    [
                        literal(`(
                            SELECT COUNT(*)
                            FROM ReviewRuleUsings AS ReviewRuleUsing
                            WHERE ReviewRuleUsing.RuleId = ReviewRule.id
                        )`),
                        'Count' // 这就是你指定的列别名
                    ]
                ]
            },
            order,
            raw: true,
        });
    }

    /**
     * 新增或创建一条规则（如需要关联书本，并同时关联）
     * @param {*} rule 
     * @returns 
     */
    async createOrUpdateReviewRule(rule) {
        const { bookId, ...rest } = rule;
        const [newRule] = await this.#ReviewRuleModel.upsert(rest);
        let addToBook = [];
        if (bookId && newRule) {
            const newData = bookId.map(id => ({ BookId: id, RuleId: newRule.id }));
            addToBook = await this.#ReviewRuleUsingModel.bulkCreate(newData, {
                ignoreDuplicates: true,     //通过唯一约束忽略已存在的组合
            });
        }
        return { ...newRule?.toJSON(), addToBook: addToBook.filter(r => r.isNewRecord).length };
    }
}
