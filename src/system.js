
import Koa from 'koa';
import { koaBody } from 'koa-body';

import { ConfigLoader } from './4_infrastructure/config/ConfigLoader.js';
import { createDatabaseConnection } from './4_infrastructure/database/DatabaseConnection.js';
import { entityDefinitions } from './3_domain/entities/index.js';
import { EbookRepository } from './4_infrastructure/repositories/EbookRepository.js';
import { BookQueryService } from './2_application/services/BookQueryService.js';
import { BookController } from './1_interfaces/http/controllers/BookController.js';
import { createMainRouter } from './1_interfaces/http/routes/index.js';

// 1. 加载配置
const configLoader = new ConfigLoader(process.env.NODE_ENV);
const config = await configLoader.load();

// 2. 数据库连接
const sequelize = createDatabaseConnection(
  config.database.path,
  config.database.logging
);

// 3. 注册领域实体（使用桶文件）
entityDefinitions.forEach(defineFn => defineFn(sequelize));

// 4. 初始化仓储
const ebookRepository = new EbookRepository(sequelize);

// 5. 初始化服务
const bookQueryService = new BookQueryService(ebookRepository);

// 6. 初始化控制器
const bookController = new BookController(bookQueryService);

// 7. 组装控制器映射
const controllers = {
  bookController,
};

// 8. 组装路由
const router = createMainRouter(controllers);

// 9. 创建 Koa 应用
const app = new Koa();
app.use(koaBody({ multipart: true })); // 支持文件上传
app.use(router.routes()).use(router.allowedMethods());

// 10. 数据库同步与种子数据
async function initializeDatabase() {
  // if (process.env.NODE_ENV === 'development') {
  await sequelize.sync({ alter: true, force: true });
  console.log('✅ 数据库表结构已同步 (development)');

  // const count = await ebookRepository.getModel().count();
  // if (count === 0) {
  //   await ebookRepository.bulkCreate([
  //     { BookName: '三体：黑暗森林', Author: '刘慈欣', Hotness: 98 },
  //     { BookName: '银河系漫游指南', Author: '道格拉斯·亚当斯', Hotness: 85 },
  //     { BookName: '代码大全', Author: '史蒂夫·迈克康奈尔', Hotness: 72 },
  //   ]);
  //   console.log('📚 已插入示例数据');
  // }
  // }
}

export { app, config, initializeDatabase, sequelize };
