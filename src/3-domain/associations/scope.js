import { literal } from "sequelize";

/**
 * 定义作用域
 * @param {*} models 
 */
export default function (models) {
    models.EbookChapter.addScope('withHasContent', {
        attributes: {
            include: [
                [
                    literal('CASE WHEN Content IS NOT NULL AND Content != "" THEN 1 ELSE 0 END'),
                    'HasContent'
                ]
            ]
        }
    });
}