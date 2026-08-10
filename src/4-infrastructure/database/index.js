// // src/4-infrastructure/database/index.js
// import { createDatabaseConnection } from './databaseConnection.js';
// import { entityDefinitions } from '../../3-domain/entities/index.js';
// import { setupAssociations } from '../../3-domain/associations/index.js';

// export function initializeDatabase(config) {
//   const sequelize = createDatabaseConnection(
//     config.database.path,
//     config.database.logging
//   );
  
//   // 注册实体 & 关联
//   entityDefinitions.forEach(defineFn => defineFn(sequelize));
//   setupAssociations(sequelize.models);
  
//   return sequelize;
// }