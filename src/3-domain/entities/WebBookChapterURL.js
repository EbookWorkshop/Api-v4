import { DataTypes } from "sequelize";

/**
 * 网文每一章对应的网络来源地址
 * @param {*} sqlConnect 
 * @returns 
 */
export default function (sqlConnect) {
    return sqlConnect.define("WebBookChapterURL", {   //每一章的地址
        Path: { type: DataTypes.STRING(500), allowNull: false },
        WebBookChapterId: { type: DataTypes.INTEGER, allowNull: false },
    }, {
        indexes: [
            {
                // 单列索引，对应 SQL: CREATE INDEX ON WebBookChapterURLs(WebBookChapterId)
                fields: ['WebBookChapterId'],
            },
        ],
    });
}