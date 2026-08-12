
import Koa from 'koa';
import { koaBody } from 'koa-body';
import { EventEmitter } from 'node:events';
import { EventManager } from './4-infrastructure/event/EventManager.js';
import { loadConfig } from './4-infrastructure/config/index.js';
import { createDatabaseConnection } from './4-infrastructure/database/databaseConnection.js';
import { entityDefinitions } from './3-domain/entities/index.js';
import { setupAssociations } from './3-domain/associations/index.js';
import { createRepositories } from './4-infrastructure/repositories/index.js';
import { createServices } from './2-application/services/index.js';
import { setupHttpServer } from './1-interfaces/http/index.js';
import { createControllers } from './1-interfaces/http/controllers/index.js';


// ============================================================
// 1. 加载配置
// ============================================================
const config = await loadConfig();

// ============================================================
// 2. 初始化数据库与领域层（Infrastructure + Domain）
// ============================================================
const sequelize = createDatabaseConnection(
  config.database.path,
  config.database.logging
);

// 注册实体与关联
entityDefinitions.forEach(defineFn => defineFn(sequelize));
setupAssociations(sequelize.models);

const eventManager = new EventManager(new EventEmitter());//消息管理模块

// ============================================================
// 3. 组装核心依赖链（依赖倒置：外层注入内层）
// ============================================================
// 3.1 仓储层 (Infrastructure)
const repositories = createRepositories(sequelize);

// 3.2 服务层 (Application) - 依赖 Repositories
const services = createServices(repositories, config);

// 3.3 控制器层 (Interfaces) - 依赖 Services
const controllers = createControllers(services, config);

// ============================================================
// 4. 组装接口层（HTTP 适配）
// ============================================================
const app = new Koa();

// 解析请求体（必须在路由前）
app.use(koaBody({ multipart: true }));

// 4.2 生成路由（依赖 Controllers）
setupHttpServer(app, config, controllers);

// ============================================================
// 5. 数据库同步与启动（开发环境）
// ============================================================
async function initializeDatabase() {
  if (config.env === 'development') {
    await sequelize.sync();//{ alter: true, force: false }
    console.log('✅ 数据库表结构已同步 (development)');
  }
}

export { app, config, initializeDatabase };
