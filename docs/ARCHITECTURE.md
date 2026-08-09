# V2 Book Collector 架构描述（供 AI 上下文）

## 项目简介
这是一个基于 **分层架构 + 依赖注入** 的 Node.js (Koa) 电子书采集系统。它严格遵循 **洋葱模型（Onion Architecture）**，内层（Domain）不依赖外层（Infrastructure），并通过组合根（Composition Root）集中组装依赖。

## 核心设计原则
1. **依赖方向**：`1_Interfaces` → `2_Application` → `3_Domain` ← `4_Infrastructure`（依赖倒置）。
2. **控制反转**：所有 `new` 操作只在 `src/system.js`（组合根）中执行。
3. **显式优于隐式**：模型注册、路由加载均使用桶文件或聚合器，不采用自动扫描。
4. **配置管理**：多层覆盖（default → env → local → 环境变量），加载器位于 `4_infrastructure/config/ConfigLoader.js`。

## 目录层级与职责
| 层级 | 目录 | 职责 |
|------|------|------|
| 1_Interfaces | `http/controllers` | HTTP 协议适配，处理 ctx，挂载 Swagger 注解 |
|  | `http/dtos` | 定义 HTTP 请求/响应结构（含 Swagger schema） |
|  | `http/routes` | 路由聚合器（显式组合子路由） |
| 2_Application | `services` | 业务用例编排，调用 Repository，返回纯 DTO |
|  | `dto` | 业务数据传输对象（不含 Swagger） |
|  | `ports` | 定义抽象接口（如 IChapterFetcher） |
| 3_Domain | `entities` | 纯数据定义（Sequelize 模型），无查询方法 |
|  | `value-objects` | 值对象（校验逻辑） |
| 4_Infrastructure | `config` | 配置加载器 |
|  | `database` | 数据库连接工厂 |
|  | `repositories` | 具体 SQL/ORM 操作 |
|  | `collectors` | 文件/网页解析（纯技术） |
|  | `workers` | 多线程任务（独立 DB 连接） |
|  | `event` | 事件总线 |
|  | `cache` | 内存缓存 |
| 5_Shared | `errors` | 自定义异常类 |
|  | `utils` | 通用工具函数 |

## 关键代码示例
### 组合根（`src/system.js`）
```javascript
// 加载配置
const config = await new ConfigLoader().load();
// 创建数据库连接
const sequelize = createDatabaseConnection(config.database.path);
// 注册实体（桶文件）
entityDefinitions.forEach(fn => fn(sequelize));
// 组装依赖链
const repo = new EbookRepository(sequelize);
const service = new BookQueryService(repo);
const controller = new BookController(service);
const routers = createMainRouter({ bookController });
// 启动应用
app.use(routers.routes());
```

### 控制器（`1_interfaces/http/controllers/BookController.js`）
- 只处理 `ctx` 解析和响应封装。
- 通过 Swagger 注解描述 API。

### 服务（`2_application/services/BookQueryService.js`）
- 纯业务逻辑，不关心 HTTP。
- 返回纯 DTO（无 ORM 元数据）。

## 配置系统
- 优先级：`default.js` < `{NODE_ENV}.js` < `local.js` < 环境变量。
- 所有配置在 `ConfigLoader.load()` 中合并后冻结。

## 扩展指南
- **新增模型**：在 `3_domain/entities/` 下创建 `XxxEntity.js`，并在 `entities/index.js` 的 `entityDefinitions` 数组中添加。
- **新增路由**：在 `1_interfaces/http/routes/` 下创建 `xxxRoutes.js`，并在 `routes/index.js` 中显式引入并挂载。
- **新增接口**：在 `controllers` 新增方法，并在对应的 DTO 目录定义请求/响应结构（含 Swagger）。

## 运行方式
```bash
npm install
npm start   # 或 npm run dev
```

## 文档输出
- 架构图：`docs/architecture.mmd`
- 类图：`docs/class-diagram.mmd`
- 时序图：`docs/sequence-diagram.mmd`
- Swagger JSON：通过 `npm run swagger` 生成 `docs/swagger.json`

## 与本 AI 协作建议
- 如需改动架构，请先说明要调整的层级和依赖方向。
- 新增功能时，我会按照“Controller → Service → Repository → Entity”的顺序生成代码。
- 涉及配置、Worker、事件等横切关注点，会优先考虑保持分层纯洁性。
