# V4 Book API V4.0 -- 开发蓝图（V2.7 ）

## 一、项目概览
之前纯手搓的项目架构（v3）从软件工程的角度看显得混乱，除了继续加功能没什么值得学习的了。所以现在尝试用新的项目架构重构整个后台。
新采用的架构是一个基于 **分层架构 + 依赖注入** 的 Node.js (Koa) 电子书采集系统。它严格遵循 **洋葱模型（Onion Architecture）**，内层（Domain）不依赖外层（Infrastructure），通过组合根（`system.js`）集中组装依赖。

### 核心设计原则

| 原则 | 说明 |
| :--- | :--- |
| **依赖倒置** | `1-interfaces` → `2-application` → `3-domain` ← `4-infrastructure`（内层绝不依赖外层） |
| **控制反转** | 所有 `new` 操作只在 `src/system.js` 及各层桶文件中执行，业务代码不直接实例化依赖 |
| **显式优于隐式** | 模型注册（桶文件）、路由加载（聚合器）均显式声明，不采用文件扫描 |
| **配置多层覆盖** | `default.js` → `{env}.js` → `local.js` → 环境变量（优先级递增） |
| **DTO 与 ORM 隔离** | Controller/Service 只处理 DTO，ORM 模型仅限 Repository 内部使用 |
| **CQS（命令查询分离）** | 查询（Query）和写入（Command）使用独立的 Service 类 |
| **HTTP 层纯粹化** | `1-interfaces/http/` 只做接口适配，不创建业务依赖，不触碰 `sequelize` |
| **Swagger 归属** | 注解写在 Controller 方法上，Schema 定义在 `http/dtos/` 目录中 |

`入口(1) → 业务(2) → 核心(3) ← 技术实现(4)`
*  `1-interfaces` 是入口（最靠外）。
*  `2-application` 编排业务（调用核心）。
*  `3-domain` 是核心实体（被所有层依赖，但因为它是定义，不是执行层，所以放在 3）。
*  `4-infrastructure` 是执行层（数据库、抓取器）。
>**数字越大 = 越靠近“底层技术细节”或“远离业务入口”**

## 二、命名规范 项目标准）

| 代码元素 | 命名风格（Case） | 示例 | 理由 |
| :--- | :--- | :--- | :--- |
| **目录 / 文件夹** | **`kebab-case`**（全小写，连字符分隔） | `1-interfaces`、`http`、`middlewares`、`database` | 1. Linux/Unix 系统区分大小写，全小写最安全。<br>2. `kebab-case` 是 npm 包和现代前端/Node 项目的通用标准（如 `@koa/router`）。<br>3. 避免与类名（大驼峰）混淆。 |
| **JavaScript 文件（导出类）** | **`PascalCase`**（大驼峰） | `BookController.js`、`ConfigLoader.js`、`EbookEntity.js` | 类名与文件名严格对应，IDE 和 `import` 时一目了然。 |
| **JavaScript 文件（导出函数/工具）** | **`camelCase`**（小驼峰） | `logger.js`、`errorHandler.js`、`databaseConnection.js` | 表明它不是一个“类实体”，而是一个“功能模块”。 |
| **变量 / 函数 / 方法** | **`camelCase`**（小驼峰） | `getBookList()`、`bookQueryService` | JavaScript 语言标准风格（`Array.prototype.map`）。 |
| **类名** | **`PascalCase`**（大驼峰） | `BookController`、`EbookRepository` | 类型与构造函数的标准标识。 |
| **常量（硬编码值）** | **`UPPER_SNAKE_CASE`**（全大写，下划线） | `MAX_RETRY_TIMES`、`DEFAULT_PORT` | 一目了然区分“可变变量”与“固定常量”。 |
> ~~~| **数据库表名 / 字段名** | **`snake_case`**（全小写，下划线） | `ebooks`、`book_name`、`hotness` | Sequelize 官方推荐（配合 `underscored: true`），与 SQL 语法习惯对齐。 |~~~   
> 数据库从旧项目沿用下来，相关命名不再变更。    

### 为什么（类 vs 函数）？
这是为了**通过“文件名”就能快速判断文件内容**，无需打开看代码：

- 看到 `BookController.js`（大驼峰） → 立即知道里面是一个 `class BookController {}`。
- 看到 `logger.js`（小驼峰） → 立即知道里面是一个 `function logger()` 或 `export const createLogger = () => {}`。

## 三、项目目录结构
```
Api-V4/
│
├── config/                                    # 【配置目录】
│   ├── default.js                             # 默认配置（所有环境继承，Git 提交）
│   ├── development.js                         # 开发环境覆盖（Git 提交）
│   ├── production.js                          # 生产环境覆盖（Git 提交）
│   └── local.js                               # 本地覆盖（.gitignore 忽略）
│
├── data/                                      # 【数据目录】SQLite 数据库文件
│   └── dev.sqlite                             # 开发数据库（自动生成）
│
├── docs/                                      # 【文档目录】
│   ├── ARCHITECTURE.md                        # 架构描述（供 AI 快速恢复上下文）
│   ├── architecture.mmd                       # 分层架构图（Mermaid）
│   ├── class-diagram.mmd                      # UML 类图（Mermaid）
│   ├── sequence-diagram.mmd                   # 运行时时序图（Mermaid）
│   └── swagger.json                           # OpenAPI 文档（npm run swagger 生成）
│
├── migrations/                                # 【迁移目录】数据库版本管理
│   └── (umzug 迁移文件)
│
├── scripts/                                   # 【辅助脚本】
│   ├── generate-swagger.js                    # 生成 Swagger JSON
│   └── start.sh                               # 启动脚本
│
├── src/                                       # 【源码根目录】
│   │
│   ├── 1-interfaces/                          # 【接口适配层】
│   │   ├── http/
│   │   │   ├── controllers/                   # 职责：处理 ctx，调用 Service，挂载 Swagger 注解
│   │   │   │   ├── index.js                   # 桶文件：组装所有 Controller
│   │   │   │   ├── BookController.js
│   │   │   │   └── SystemConfigController.js
│   │   │   ├── dtos/                          # 职责：HTTP 请求/响应结构（含 Swagger schema）
│   │   │   │   └── BookListResponse.js
│   │   │   ├── routes/                        # 职责：路由聚合器（显式组合子路由）
│   │   │   │   ├── index.js                   # 主路由聚合器
│   │   │   │   └── bookRoutes.js
│   │   │   ├── middlewares/                   # 职责：错误处理、CORS、日志、响应包装
│   │   │   │   ├── index.js                   # 桶文件：统一注册所有中间件
│   │   │   │   ├── errorHandler.js
│   │   │   │   ├── cors.js
│   │   │   │   ├── logger.js
│   │   │   │   └── responseWrapper.js
│   │   │   └── index.js                       # HTTP 层入口（只做适配，不创建业务依赖）
│   │   └── websocket/                         # WebSocket 协议（可选）
│   │
│   ├── 2-application/                         # 【应用服务层】业务用例编排
│   │   ├── services/                          # 职责：实现业务用例，编排 Repository
│   │   │   ├── index.js                       # 桶文件：组装所有 Service
│   │   │   ├── BookQueryService.js            # 查询服务（只读）
│   │   │   ├── BookCommandService.js          # 命令服务（写入）
│   │   │   ├── SystemConfigService.js         # 系统配置服务
│   │   │   └── FontService.js                 # 字体服务
│   │   ├── dto/                               # 职责：业务数据传输对象（Service 层内部传递）
│   │   │   └── ChapterContentDTO.js
│   │   └── ports/                             # 职责：定义抽象接口（依赖倒置）
│   │       └── IChapterFetcher.js
│   │
│   ├── 3-domain/                              # 【领域模型层】纯数据结构
│   │   ├── entities/                          # 职责：数据库表结构映射（Sequelize 定义）
│   │   │   ├── index.js                       # 桶文件：导出所有实体定义
│   │   │   └── EbookEntity.js
│   │   ├── associations/                      # 职责：模型关系定义（hasMany/belongsTo）
│   │   │   └── index.js
│   │   ├── constants/                         # 职责：业务常量
│   │   │   └── SystemConfigGroup.js
│   │   └── value-objects/                     # 职责：值对象（校验逻辑）
│   │       └── ISBN.js
│   │
│   ├── 4-infrastructure/                      # 【基础设施层】具体技术实现
│   │   ├── config/                            # 职责：配置加载与管理
│   │   │   ├── index.js                       # 桶文件
│   │   │   └── ConfigLoader.js
│   │   ├── database/                          # 职责：数据库连接
│   │   │   └── databaseConnection.js
│   │   ├── repositories/                      # 职责：具体 SQL/ORM 操作
│   │   │   ├── index.js                       # 桶文件：组装所有 Repository
│   │   │   ├── EbookRepository.js
│   │   │   ├── TagRepository.js
│   │   │   └── SystemConfigRepository.js
│   │   ├── collectors/                        # 职责：纯数据采集/解析（不碰数据库）
│   │   │   ├── EpubParser.js
│   │   │   ├── PdfParser.js
│   │   │   └── WebChapterFetcher.js
│   │   ├── workers/                           # 职责：多线程任务执行端
│   │   │   ├── WorkerPool.js
│   │   │   └── WorkerRunner.js
│   │   ├── server/                            # 职责：文件系统工具
│   │   │   └── fileSystemUtils.js
│   │   ├── event/                             # 职责：事件总线
│   │   │   └── EventManager.js
│   │   ├── cache/                             # 职责：内存缓存
│   │   │   └── MemoryCache.js
│   │   └── debug/                             # 职责：开发调试辅助
│   │       └── DebugLogger.js
│   │
│   ├── 5-shared/                              # 【共享工具层】跨层通用工具
│   │   ├── errors/                            # 职责：自定义业务异常类
│   │   │   └── AppError.js
│   │   └── utils/                             # 职责：纯工具函数
│   │       └── (仅放真正复杂的、跨领域的纯函数)
│   │
│   ├── system.js                              # 【组合根】唯一组装所有依赖的地方
│   │                                          # 职责：调用各层桶文件，组装依赖链，启动应用
│   │                                          # 新增模块时，此文件不改动（由桶文件承接）
│   │
│   └── app.js                                 # 【应用入口】启动服务器（极其轻薄）
│
├── tests/                                     # 【测试目录】
│   ├── unit/                                  # 单元测试（Domain + Application 层）
│   └── integration/                           # 集成测试（Infrastructure 层 + 真实 DB）
│
├── .env                                       # 环境变量（最高优先级，不提交）
├── .env.example                               # 环境变量模板
├── .gitignore
├── package.json
└── README.md
```

---


## 扩展示例：如何新增一个功能模块？

### 1. 新增模型（如 `User`）
- 在 `3-domain/entities/UserEntity.js` 定义 Sequelize 模型
- 在 `3-domain/entities/index.js` 的 `entityDefinitions` 数组中追加导入

### 2. 新增路由
- 在 `1-interfaces/http/routes/userRoutes.js` 定义子路由
- 在 `1-interfaces/http/routes/index.js` 中显式导入并挂载

### 3. 新增接口
- 在 `1-interfaces/http/dtos/` 定义请求/响应 Schema（含 Swagger）
- 在 `1-interfaces/http/controllers/UserController.js` 新增方法，挂载 Swagger 注解
- 在 `1-interfaces/http/controllers/index.js` 中显式导入并挂载



