import Sequelize from 'sequelize';

/**
 * 数据库链接工厂
 * @param {*} dbPath 数据库地址
 * @param {*} logging 是否开启日志（控制台
 * @returns 
 */
export function createDatabaseConnection(dbPath, logging = false) {
  return new Sequelize({
    dialect: 'sqlite',
    storage: dbPath,
    logging: logging ? console.log : false,
    pool: { max: 5, min: 0, acquire: 30000, idle: 10000 },
    dialectOptions: { foreignKeys: true },
  });
}
