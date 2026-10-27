import { setupAssociations } from "../../3-domain/associations/index.js";
import { entityDefinitions } from "../../3-domain/entities/index.js";
import * as DBHelper from "../database/index.js";
import { createRepositories } from "../repositories/index.js";
// src/system.js
import { logger } from '../../5-shared/logging/index.js';
import { ConsoleLogger } from '../../4-infrastructure/logging/ConsoleLogger.js'; // 未来可换：import { FileLogger } from './4-infrastructure/logging/FileLogger.js';



export async function createMiniCore(config) {
    const dbPath = config?.database?.path;
    const logging = config?.database?.logging;

    const loggerImpl = new ConsoleLogger(); // 或根据 config 选择
    logger.initialize(config.debug, loggerImpl);

    const sequelize = await DBHelper.createDatabaseConnection(dbPath, logging);
    entityDefinitions.forEach(defineFn => defineFn(sequelize));
    setupAssociations(sequelize.models);

    // ✅ 只实例化仓储层（成本极低，全部加载）
    const repositories = createRepositories(sequelize);

    const transactionManager = DBHelper.createDatabaseTransaction(sequelize);

    return {
        version: config?.version,
        logger,
        sequelize,
        repositories,
        transactionManager,
        async close() {
            await sequelize.close();
        }
    };
}