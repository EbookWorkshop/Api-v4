import { setupAssociations } from "../../3-domain/associations/index.js";
import { entityDefinitions } from "../../3-domain/entities/index.js";
import * as DBHelper from "../database/index.js";
import { createRepositories } from "../repositories/index.js";


export function createMiniCore(config) {
    const dbPath = config?.database?.path;
    const logging = config?.database?.logging;

    const sequelize = DBHelper.createDatabaseConnection(dbPath, logging);
    entityDefinitions.forEach(defineFn => defineFn(sequelize));
    setupAssociations(sequelize.models);

    // ✅ 只实例化仓储层（成本极低，全部加载）
    const repositories = createRepositories(sequelize);

    const transactionManager = DBHelper.createDatabaseTransaction(sequelize);

    return {
        sequelize,
        repositories,
        transactionManager,
        async close() {
            await sequelize.close();
        }
    };
}