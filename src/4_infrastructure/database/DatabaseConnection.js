import Sequelize from 'sequelize';

export function createDatabaseConnection(dbPath, logging = false) {
  return new Sequelize({
    dialect: 'sqlite',
    storage: dbPath,
    logging: logging ? console.log : false,
    pool: { max: 5, min: 0, acquire: 30000, idle: 10000 },
    dialectOptions: { foreignKeys: true },
  });
}
