import { DataTypes } from 'sequelize';

export default function defineEbookEntity(sequelize) {
  return sequelize.define('Ebook', {
    id: {
      type: DataTypes.INTEGER,
      primaryKey: true,
      autoIncrement: true,
    },
    BookName: {
      type: DataTypes.STRING(50),
      allowNull: false,
    },
    Author: {
      type: DataTypes.STRING(20),
      allowNull: true,
    },
    Hotness: {
      type: DataTypes.INTEGER,
      defaultValue: 0,
    },
  }, {
    tableName: 'ebooks',
    timestamps: true,
  });
}
