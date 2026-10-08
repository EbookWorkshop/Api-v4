import { DataTypes } from "sequelize";

/**
 * 缓存的网页地址
 * @param {*} sqlConnect 
 * @returns 
 */
export default function (sqlConnect) {
    return sqlConnect.define("Storage", {
        BookName: { type: DataTypes.STRING(50), allowNull: false },
        Source: { type: DataTypes.STRING(120), allowNull: false },
        CoverImage: { type: DataTypes.STRING(120), allowNull: true },
        Author: { type: DataTypes.STRING(25), allowNull: true },
        Host: { type: DataTypes.STRING(25), allowNull: false },
        Show: {//展示次数，用于动态轮动展示
            type: DataTypes.INTEGER,
            defaultValue: 0
        },
    }, {
        indexes: [{ fields: ['BookName'] }, { fields: ['Source'], unique: true }]
    });
}