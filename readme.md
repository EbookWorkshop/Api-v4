# V4 Book Collector 架构蓝图 V4.0

## 项目根目录

```
Api-V4/
│
├── config/                                 # 【配置目录】存放所有配置文件（与 src 平级）
│   ├── default.js                          # 默认配置（所有环境继承，Git 提交）
│   ├── development.js                      # 开发环境覆盖（Git 提交）
│   ├── production.js                       # 生产环境覆盖（Git 提交）
│   └── local.js                            # 本地覆盖（.gitignore 忽略，开发者个人调试）
│
├── data/                                   # 【数据目录】SQLite 数据库文件存放处
│   └── dev.sqlite                          # 开发环境数据库（自动生成）
│
├── docs/                                   # 【文档目录】架构图、UML、AI 上下文
│   ├── ARCHITECTURE.md                     # 架构描述（供 AI 快速恢复上下文）
│   ├── architecture.mmd                    # 分层架构图（Mermaid）
│   ├── class-diagram.mmd                   # UML 类图（Mermaid）
│   ├── sequence-diagram.mmd                # 运行时时序图（Mermaid）
│   └── swagger.json                        # OpenAPI 文档（npm run swagger 生成）
│
├── migrations/                             # 【迁移目录】数据库版本管理脚本
│   └── (umzug 迁移文件)                    # 替代 sync({ alter: true })
│
├── scripts/                                # 【辅助脚本】开发/运维工具
│   ├── generate-swagger.js                 # 生成 Swagger JSON 文档
│   └── start.sh                            # 启动脚本（可选）
│
├── tests/                                  # 【测试目录】
│   ├── unit/                               # 单元测试（Domain + Application 层）
│   └── integration/                        # 集成测试（Infrastructure 层 + 真实 DB）
│
├── src/                                    # 【源码根目录】所有新代码
│   │
│   ├── 1-Taginterfaces/                       # 【接口适配层】外部请求的入口与协议适配
│   │   ├── http/                           # HTTP 协议（Koa）
│   │   │   ├── controllers/                # 职责：解析 ctx，调用 Service，封装 HTTP 响应。挂载 Swagger 注解。
│   │   │   │   └── BookController.js
│   │   │   ├── dtos/                       # 职责：定义 HTTP 请求/响应结构。包含 Swagger schema 注解。
│   │   │   │   └── BookListResponse.js
│   │   │   ├── routes/                     # 职责：路由聚合器（显式组合子路由）。只做 URL → Controller 映射。
│   │   │   │   ├── index.js                # 显式导入所有子路由，组合成一个主路由
│   │   │   │   └── bookRoutes.js           # 书籍模块子路由
│   │   │   └── middlewares/                # 职责：鉴权、日志、错误处理等横切关注点
│   │   └── websocket/                      # WebSocket 协议（可选）
│   │       └── SocketService.js            # 职责：处理 ws 连接，将消息转为内部命令
│   │
│   ├── 2-Tagapplication/                      # 【应用服务层】业务用例编排（核心大脑）
│   │   ├── services/                       # 职责：实现具体业务用例（Use Cases）。编排 Repository 和 Ports。
│   │   │   ├── BookQueryService.js         # 书籍查询用例（返回纯 DTO）
│   │   │   ├── EpubImportService.js        # EPUB 一次性导入用例
│   │   │   └── WebBookCollectionService.js # 网页增量采集用例（含断点续传逻辑）
│   │   ├── dto/                            # 职责：业务数据传输对象（Service 层内部传递）
│   │   │   ├── ChapterContentDTO.js        # 单章内容载体（内存中永远只存一章）
│   │   │   └── CreateBookCommand.js        # 用户发起采集时的入参
│   │   └── ports/                          # 职责：定义抽象接口（依赖倒置原则）
│   │       └── IChapterFetcher.js          # 抓取器抽象契约（Service 依赖抽象，而非具体实现）
│   │
│   ├── 3-Tagdomain/                           # 【领域模型层】纯数据结构（与技术无关）
│   │   ├── entities/                       # 职责：数据库表结构映射（Sequelize 定义）
│   │   │   ├── index.js                    # 桶文件：显式导出所有实体定义函数（新增模型只改这里）
│   │   │   ├── EbookEntity.js              # Ebook 表定义（仅字段、类型、关联）
│   │   │   ├── ChapterEntity.js            # 章节表定义
│   │   │   └── CollectionTaskEntity.js     # 采集任务进度表定义
│   │   ├── associations/                   # 职责：模型关系定义
│   │   │   ├── index.js                    # 核心：导出一个 setupAssociations 函数
│   │   │   └── scope.js                    # 原 Scope 文件迁移至此（如果它定义了查询作用域）
│   │   └── value-objects/                  # 职责：值对象（封装校验逻辑）
│   │       └── ISBN.js                     # ISBN 校验与格式化（如需要）
│   │
│   ├── 4-Taginfrastructure/                   # 【基础设施层】具体技术实现（可替换的细节）
│   │   ├── config/                         # 职责：配置加载与管理
│   │   │   └── ConfigLoader.js             # 多层配置合并器（default → env → local → 环境变量）
│   │   ├── database/                       # 职责：数据库连接管理
│   │   │   ├── DatabaseConnection.js       # 纯工厂函数：创建 Sequelize 实例（主线程/Worker 均使用）
│   │   │   └── TransactionManager.js       # 事务管理器（AsyncLocalStorage 无感透传）
│   │   ├── repositories/                   # 职责：具体的 SQL/ORM 操作（原 OTO 的新家）
│   │   │   ├── EbookRepository.js          # Ebook 表增删改查（封装所有复杂查询条件）
│   │   │   ├── ChapterRepository.js        # 章节逐条插入、幂等性检查
│   │   │   └── CollectionTaskRepository.js # 采集进度读写（getTask, updateProgress）
│   │   ├── collectors/                     # 职责：纯数据采集/解析（不碰数据库）
│   │   │   ├── EpubParser.js               # 解析 .epub 文件，输出 ChapterContentDTO 数组
│   │   │   ├── PdfParser.js                # 解析 .pdf 文本布局
│   │   │   └── WebChapterFetcher.js        # 逐章抓取网页（实现 IChapterFetcher 接口）
│   │   ├── workers/                        # 职责：多线程任务执行端（原 Worker 目录）
│   │   │   ├── WorkerPool.js               # 管理子线程生命周期（创建、销毁、并发数控制）
│   │   │   └── WorkerRunner.js             # 子线程入口（拥有独立 DB 连接，自主持久化）
│   │   ├── loaders/                        # 职责：自动加载器（可选，但推荐显式聚合器）
│   │   │   └── (如有特殊需求可放置扫描器)   # 注意：模型/路由已使用显式聚合器，此目录保留备用
│   │   ├── event/                          # 职责：全局事件总线（原 EventManager）
│   │   │   └── EventManager.js             # 模块间解耦通信（Service 发送事件，Handler 订阅）
│   │   ├── cache/                          # 职责：内存缓存（原 MemoryCache）
│   │   │   └── MemoryCache.js              # 存储报错信息或热点数据（工具类，按需注入）
│   │   ├── debug/                          # 职责：开发调试辅助（原 debug.js）
│   │   │   └── DebugLogger.js              # 监听错误事件，格式化输出到控制台
│   │   └── server/                         # 职责：文件与目录工具（原 Server.js）
│   │       └── FileSystemUtils.js          # 封装 fs 操作（递归创建目录、检查文件存在性）
│   │
│   ├── 5-Tagshared/                           # 【共享工具层】跨层通用的零散工具
│   │   ├── errors/                         # 职责：自定义业务异常类
│   │   │   ├── AppError.js                 # 基类（统一错误码处理）
│   │   │   └── CollectionInterruptedError.js # 采集被用户手动终止的特定异常
│   │   └── utils/                          # 职责：零依赖工具函数
│   │       └── StringHelper.js             # 去除 HTML 标签、截断摘要等纯函数
│   │
│   ├── app.js                              # 【应用启动入口】Koa 实例化与监听端口（极其轻薄）
│   │                                       # 职责：调用 system.js 组装好的 app，启动服务器
│   │
│   └── system.js                           # 【组合根/依赖容器】唯一组装所有依赖的地方
│                                            # 职责：new 所有类、加载配置、注册实体、组装依赖链
│                                            # 新增模块只改这里（或桶文件），业务代码无感知
│
├── .env                                    # 环境变量（最高优先级，不提交）
├── .env.example                            # 环境变量模板（提交 Git）
├── .gitignore                              # Git 忽略规则
├── package.json                            # 项目依赖与脚本
└── README.md                               # 项目说明（含快速开始指南）
```

---

## 蓝图核心设计原则

| 原则 | 说明 |
| :--- | :--- |
| **依赖方向** | `1-TagInterfaces` → `2-TagApplication` → `3-TagDomain` ← `4-TagInfrastructure`（内层绝不依赖外层） |
| **组合根唯一性** | 所有 `new` 操作只在 `src/system.js` 中出现，其他地方不得实例化 Service/Repository |
| **显式优于隐式** | 模型注册（桶文件）、路由加载（聚合器）均显式声明，不采用文件扫描（除非特殊需求） |
| **配置多层覆盖** | `default.js` → `{env}.js` → `local.js` → 环境变量（优先级递增） |
| **DTO 与 ORM 隔离** | Controller/Service 只处理 DTO，ORM 模型仅限 Repository 内部使用 |
| **Swagger 归属** | 注解写在 Controller 方法上，Schema 定义在 `http/dtos/` 目录中 |

`入口(1) → 业务(2) → 核心(3) ← 技术实现(4)`

*  `1-TagInterfaces` 是入口（最靠外）。
*  `2-TagApplication` 编排业务（调用核心）。
*  `3-TagDomain` 是核心实体（被所有层依赖，但因为它是定义，不是执行层，所以放在 3）。
*  `4-TagInfrastructure` 是执行层（数据库、抓取器）。
---

## 扩展示例：如何新增一个功能模块？

### 1. 新增模型（如 `User`）
- 在 `3-Tagdomain/entities/UserEntity.js` 定义 Sequelize 模型
- 在 `3-Tagdomain/entities/index.js` 的 `entityDefinitions` 数组中追加导入

### 2. 新增路由
- 在 `1-Taginterfaces/http/routes/userRoutes.js` 定义子路由
- 在 `1-Taginterfaces/http/routes/index.js` 中显式导入并挂载

### 3. 新增接口
- 在 `1-Taginterfaces/http/dtos/` 定义请求/响应 Schema（含 Swagger）
- 在 `1-Taginterfaces/http/controllers/UserController.js` 新增方法，挂载 Swagger 注解
- 在 `src/system.js` 中实例化 Controller，注入对应的 Service

## 命名规范（项目标准）

| 代码元素 | 命名风格（Case） | 示例 | 理由 |
| :--- | :--- | :--- | :--- |
| **目录 / 文件夹** | **`kebab-case`**（全小写，连字符分隔） | `1-interfaces`、`http`、`middlewares`、`database` | 1. Linux/Unix 系统区分大小写，全小写最安全。<br>2. `kebab-case` 是 npm 包和现代前端/Node 项目的通用标准（如 `@koa/router`）。<br>3. 避免与类名（大驼峰）混淆。 |
| **JavaScript 文件（导出类）** | **`PascalCase`**（大驼峰） | `BookController.js`、`ConfigLoader.js`、`EbookEntity.js` | 类名与文件名严格对应，IDE 和 `import` 时一目了然。 |
| **JavaScript 文件（导出函数/工具）** | **`camelCase`**（小驼峰） | `logger.js`、`errorHandler.js`、`databaseConnection.js` | 表明它不是一个“类实体”，而是一个“功能模块”。 |
| **变量 / 函数 / 方法** | **`camelCase`**（小驼峰） | `getBookList()`、`bookQueryService` | JavaScript 语言标准风格（`Array.prototype.map`）。 |
| **类名** | **`PascalCase`**（大驼峰） | `BookController`、`EbookRepository` | 类型与构造函数的标准标识。 |
| **常量（硬编码值）** | **`UPPER_SNAKE_CASE`**（全大写，下划线） | `MAX_RETRY_TIMES`、`DEFAULT_PORT` | 一目了然区分“可变变量”与“固定常量”。 |
| **数据库表名 / 字段名** | **`snake_case`**（全小写，下划线） | `ebooks`、`book_name`、`hotness` | Sequelize 官方推荐（配合 `underscored: true`），与 SQL 语法习惯对齐。 |

### 为什么（类 vs 函数）？
这是为了**通过“文件名”就能快速判断文件内容**，无需打开看代码：

- 看到 `BookController.js`（大驼峰） → 立即知道里面是一个 `class BookController {}`。
- 看到 `logger.js`（小驼峰） → 立即知道里面是一个 `function logger()` 或 `export const createLogger = () => {}`。
