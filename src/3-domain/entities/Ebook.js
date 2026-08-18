import { DataTypes } from "sequelize";

/**
 * Ebook 表
 */
export default function (sqlConnect) {
    return sqlConnect.define("Ebook", {
        BookName: {
            type: DataTypes.STRING(50),
            allowNull: false
        },
        Author: {
            type: DataTypes.STRING(20),
            allowNull: true
        },
        CoverImg: {
            type: DataTypes.STRING(50),
            allowNull: true
        },
        Hotness: {//Heat（热度/关注度）。Hotness（辣度/性感度/物理上的温度）。Readership（读者量/阅读人次）更精确。
            type: DataTypes.INTEGER,
            defaultValue: 0
        },
        TotalWord: {
            type: DataTypes.INTEGER,
            defaultValue: 0
        },
    });
}