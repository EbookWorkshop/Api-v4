import { Op, literal } from "sequelize";
export class ReviewRuleRepository {
    #ReviewRuleModel;
    // #ReviewRuleUsingModel;

    constructor(sequelize) {
        this.#ReviewRuleModel = sequelize.models.ReviewRule;
        // this.#ReviewRuleUsingModel = sequelize.models.ReviewRuleUsing;
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
}
