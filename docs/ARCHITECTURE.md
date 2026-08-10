# V4 Book API 架构描述 V2.7

## 项目简介
基于 **分层架构 + 依赖注入** 的 Node.js (Koa) 电子书采集系统。严格遵循 **洋葱模型**，内层（Domain）不依赖外层（Infrastructure），通过组合根（`system.js`）集中组装依赖。

## 核心设计原则
1. **依赖方向**：`1-interfaces` → `2-application` → `3-domain` ← `4-infrastructure`
2. **控制反转**：所有 `new` 操作只在 `src/system.js`（组合根）中执行
3. **显式优于隐式**：模型注册（桶文件）、路由加载（聚合器）均显式声明
4. **配置多层覆盖**：`default.js` → `{env}.js` → `local.js` → 环境变量
5. **CQS（命令查询分离）**：`BookQueryService` 只读，`BookCommandService` 写入

## 命名规范
| 元素 | 风格 | 示例 |
|------|------|------|
| 目录 | kebab-case | `1-interfaces`, `http` |
| 类文件 | PascalCase | `BookController.js` |
| 函数/工具文件 | camelCase | `logger.js` |
| 类名 | PascalCase | `BookQueryService` |
| 变量/函数 | camelCase | `getBookList()` |
| 数据库字段 | snake_case | `book_name`, `created_at` |

## 目录层级与职责
| 层级 | 目录 | 职责 |
|------|------|------|
| 1-interfaces | `http/controllers` | HTTP 协议适配，处理 ctx，挂载 Swagger 注解 |
| | `http/dtos` | HTTP 请求/响应结构（含 Swagger schema） |
| | `http/routes` | 路由聚合器（显式组合子路由） |
| | `http/middlewares` | 错误处理、日志、响应包装 |
| 2-application | `services` | 业务用例编排（Query/Command 分离） |
| | `dto` | 业务数据传输对象（不含 Swagger） |
| | `ports` | 定义抽象接口（依赖倒置） |
| 3-domain | `entities` | 纯数据定义（Sequelize 模型），无查询方法 |
| | `associations` | 模型关系定义（hasMany/belongsTo） |
| 4-infrastructure | `config` | 配置加载器 |
| | `database` | 数据库连接工厂 |
| | `repositories` | 具体 SQL/ORM 操作 |
| | `collectors` | 文件/网页解析 |
| 5-shared | `errors` | 自定义异常类 |
| | `utils` | 通用工具函数 |

## 组合根（system.js）依赖组装顺序
```
1. loadConfig()                    → 配置对象
2. createDatabaseConnection()      → sequelize 实例
3. entityDefinitions.forEach()     → 注册领域实体
4. setupAssociations()             → 设置模型关联
5. createRepositories(sequelize)   → 仓储层
6. createServices(repositories)    → 服务层（Query + Command）
7. createControllers(services)     → 控制器层
8. setupHttpServer(app, config, controllers) → 挂载路由与中间件
```

## HTTP 层（1-interfaces/http）的纯粹性
- **只做接口适配**：挂载中间件、注册路由
- **不创建业务依赖**：不 `new` 任何 Service 或 Repository
- **只接收组装好的 Controllers**：由 `system.js` 注入

## 中间件执行顺序（洋葱模型）
```
请求进入
  ↓
1. ErrorHandler (最外层，捕获所有异常)
  ↓
2. koaBody (解析请求体)
  ↓
3. Logger (记录请求/响应)
  ↓
4. ResponseWrapper (包装响应为 {code, data, msg})
  ↓
5. Router → Controller → Service (业务逻辑)
  ↓
响应返回
```

## 扩展指南
- **新增模型**：在 `3-domain/entities/` 创建 `XxxEntity.js`，在 `entities/index.js` 的 `entityDefinitions` 数组中追加
- **新增服务**：在 `2-application/services/` 创建 `XxxService.js`，在 `services/index.js` 的 `createServices` 中追加
- **新增控制器**：在 `1-interfaces/http/controllers/` 创建 `XxxController.js`，在 `controllers/index.js` 的 `createControllers` 中追加
- **新增路由**：在 `1-interfaces/http/routes/` 创建 `xxxRoutes.js`，在 `routes/index.js` 中显式引入并挂载

## 运行方式
```bash
npm install
npm start   # 或 npm run dev
```

## 关键变更（V2.7）
- **职责回归**：将数据库、仓储、服务的组装权责交还给 `system.js`
- **HTTP 层纯粹化**：`1-interfaces/http/` 只做接口适配，不触碰业务依赖
- **依赖流向修正**：`system.js` → 各层桶文件 → 具体实现
