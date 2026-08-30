import { DataTypes } from "sequelize";

/**
 * WebBook 目录页 网页地址
 * @param {*} sqlConnect 
 * @returns 
 */
export default function (sqlConnect) {
    return sqlConnect.define("WebBookIndexSourceURL", {   //书目录页URL
        Path: { type: DataTypes.STRING(500), allowNull: true },
        WebBookId: { type: DataTypes.INTEGER, allowNull: false },
        Type: { type: DataTypes.STRING(16), allowNull: true },  //网页类型（info/信息、index/目录）用于应对简介和章节分开页面的书籍。缺省为二合一。 v4.0新增
    }, {
        indexes: [{ fields: ['WebBookId'] }]
    });
}