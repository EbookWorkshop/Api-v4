import { DataTypes } from "sequelize";

/**
 * 缓存的网页地址
 * @param {*} sqlConnect 
 * @returns 
 */
export default function (sqlConnect) {
    return sqlConnect.define("StorageStep", {
        LastPage: { type: DataTypes.STRING(120), allowNull: false },
        Host: { type: DataTypes.STRING(25), allowNull: false },
    }, {
        indexes: [{ fields: ['Host'] }]
    });
}