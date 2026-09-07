# EBook Workshop V4 — 项目架构手册

---

## 一、核心设计原则

| 原则 | 说明 |
| :--- | :--- |
| **分层架构（洋葱模型）** | `1-interfaces` → `2-application` → `3-domain` ← `4-infrastructure`（内层不依赖外层） |
| **依赖倒置** | 高层模块不依赖低层模块，双方依赖抽象（端口）。具体实现（适配器）在 `4-infrastructure` 中。 |
| **控制反转（组合根）** | 所有依赖的组装集中在 `system.js` 及各层桶文件（`index.js`）中，业务代码不 `new` 具体依赖。 |
| **配置多层覆盖** | `default.js` → `{env}.js` → `local.js` → 环境变量，逐级覆盖，最终配置在 `config/index.js` 加载。 |
| **DTO 与 ORM 隔离** | Controller/Service 只处理 DTO（纯对象），Sequelize 模型仅在 Repository 内部使用。 |
| **CQS（命令查询分离）** | 查询（Query）和写入（Command）使用独立的 Service 类（如 `BookQueryService` 与 `BookCommandService`）。 |
| **HTTP 层纯粹化** | `1-interfaces/http/` 只做协议适配，不创建业务依赖，不直接触碰数据库。 |
| **Swagger 注解内联** | 注解写在 Controller 方法上，Schema 定义在 `http/dtos/` 目录中，由 `swagger-jsdoc` 自动收集。 |
| **显式优于隐式（部分）** | 模型注册、控制器注册、服务注册均在桶文件显式声明；**路由加载支持自动扫描（也可手工扩展）**。 |

---

## 二、目录结构与职责

```
src/
├── 1-interfaces/                     # 接口适配层（对外暴露的协议）
│   ├── http/
│   │   ├── controllers/              # 控制器：解析请求参数，调用服务，设置响应
│   │   ├── dtos/                     # 数据传输对象（含 Swagger Schema）
│   │   │   ├── components/           # 公共组件（ApiResponse, BookIdRequest 等）
│   │   │   └── {module}/             # 各业务模块的 DTO
│   │   ├── middlewares/              # Koa 中间件（错误、CORS、日志、响应包装、静态文件）
│   │   └── routes/                   # 路由定义（*.routes.js），由 index.js 自动加载
│   └── websocket/                    # WebSocket 适配
│       ├── handlers/                 # Socket 事件处理器（注册客户端事件和全局广播）
│       └── index.js                  # WebSocket 服务器装配
│
├── 2-application/                    # 应用层（用例编排、业务服务、端口定义）
│   ├── constants/                    # 应用级常量（建议迁移至此，见下文）
│   ├── dto/                          # 应用层 DTO（服务间传递或跨线程传递）
│   ├── orchestrators/                # 编排器（监听事件，协调多个服务完成复杂流程）
│   ├── ports/                        # 端口抽象（定义基础设施必须实现的接口）
│   ├── services/                     # 应用服务（业务用例实现）
│   │   ├── executor/                 # 任务执行器（实现 ITaskExecutor，供 Worker 调用）
│   │   └── index.js                  # 服务组装工厂
│   └── thread-assemblers/            # 工作线程专属装配器（为子线程组装独立服务实例）
│
├── 3-domain/                         # 领域层（业务核心概念、规则、常量）
│   ├── associations/                 # 模型关联定义（Sequelize 关系映射）
│   ├── constants/                    # 领域常量（如 BookConstants, Rule 名称等）
│   └── entities/                     # 领域实体（Sequelize 模型定义）
│
├── 4-infrastructure/                 # 基础设施层（技术实现细节）
│   ├── cache/                        # 缓存（如内存缓存）
│   ├── config/                       # 配置加载器
│   ├── container/                    # 轻量级容器（用于子线程快速构建核心依赖）
│   ├── database/                     # 数据库连接、事务管理
│   ├── email/                        # 邮件发送（Nodemailer 适配器）
│   ├── event/                        # 事件管理器（封装 EventEmitter，支持跨线程转发）
│   ├── fetchers/                     # 数据抓取器（Axios、Puppeteer）及规则引擎
│   ├── repositories/                 # 数据仓储（实现 SQL/ORM 操作）
│   ├── server/                       # 服务器基础设施
│   │   ├── adapters/                 # 适配器（文件系统扫描/写入，实现端口接口）
│   │   ├── drivers/                  # 底层驱动（文件系统底层操作）
│   │   ├── generators/               # 导出文件生成器（Epub/Pdf/Txt）及工厂
│   │   └── ServiceServer.js          # 系统信息服务（版本、状态检查）
│   └── workers/                      # 多线程支持
│       ├── pool/                     # 线程池（WorkerPool, WorkerQueue）
│       ├── runner/                   # 工作线程入口（run.js 无 DB，runOnDB.js 带 DB）
│       └── tasks/                    # 任务定义（Task）和任务分配器（assignTasks）
│
├── 5-shared/                         # 共享工具与通用错误
│   ├── errors/                       # 自定义错误类（AppError, UserInputError）
│   └── utils/                        # 通用工具函数（文件大小、字符串校阅、站点解析等）
│
├── app.js                            # 应用入口（启动 HTTP 服务器）
└── system.js                         # 系统组合根（加载配置、初始化数据库、组装依赖）
```

---

## 三、关键架构决策与实现

### 1. 依赖注入与组合根
- **组合根**：`system.js` 是唯一负责组装所有对象的地方。它初始化数据库、仓储、服务、控制器、HTTP 服务器、WebSocket 和线程池。
- **子线程独立装配**：`thread-assemblers/` 中的文件在 Worker 内部运行，通过 `assignTasks` 动态加载所需的执行器，**不与主线程共享服务实例**，避免线程安全问题。
- **所有 `new` 操作**仅限于 `system.js` 及各层桶文件（如 `services/index.js`、`controllers/index.js`、`repositories/index.js`），业务代码中绝无直接实例化。

### 2. 事件驱动架构
- 使用 `EventManager`（封装 `EventEmitter`）实现**松耦合的事件发布/订阅**。
- 核心事件类型：
  - **采集事件**（`COLLECT_EVENTS`）：`CREATE_BOOK`、`UPDATE_INDEX`、`UPDATE_CHAPTER` 等，用于跨线程通知采集进度。
  - **导出事件**（`EXPORT_EVENTS`）：`FILE_GENERATED`、`MAIL_SENT`、`INVENTORY_ARCHIVE` 等，由 `ExportOrchestrator` 监听并协调后续操作。
  - **消息事件**（`MESSAGE_SEND`）：用于向客户端推送通知（通过 WebSocket）。
- **跨线程事件转发**：`EventManager.emitToMain()` 可将子线程事件转发至主线程，再由主线程广播给客户端或触发其他服务。

### 3. 任务调度与多线程
- **线程池**：`WorkerPool` 管理可复用的 Worker 线程，支持有/无数据库连接两种 Worker 类型，自动回收闲置线程。
- **任务定义**：`Task` 类封装 `taskType`、参数、回调、优先级等元数据，提交至线程池排队执行。
- **任务类型**（`TASK_TYPES`）：包括 `EXPORT_BOOK`、`WEB_BOOK_COLLECT`、`WEB_BOOK_UPDATE_INDEX`、`SYSTEM_VERSION`、`BOTRULE_VIS`、`COMPRESS_DATABASE` 等。
- **执行器**（`executor/`）：每个任务类型对应一个 `ITaskExecutor` 实现，在 Worker 内部执行具体业务逻辑。
- **线程隔离**：每个 Worker 独立加载配置、数据库连接（或无需连接），通过 `thread-assemblers` 动态组装所需服务。

### 4. 仓储与事务
- 每个 Repository 负责一个聚合根的持久化，方法返回**纯对象**（`raw: true`）或 DTO，不返回 ORM 模型。
- 事务通过 `ITransaction` 接口管理，实现类 `DatabaseTransaction` 封装 Sequelize 事务。服务层可通过 `runInTransaction` 确保跨表操作的原子性。

### 5. 文件系统适配
- 端口 `IFileScanner` / `IFileWriter` 定义文件操作抽象，基础设施层通过 `FileSystemScanner` / `FileSystemWriter` 实现。
- 支持文件读写、目录扫描、重命名、删除、格式转换（如转 PNG）等，所有路径均以仓库根目录为基准。

### 6. 配置管理
- 配置加载器 `ConfigLoader` 按顺序合并 `config/default.js`、`config/{env}.js`、`config/local.js`，再覆盖环境变量。
- 支持运行时动态配置（通过 `SystemConfigService` 存储键值对），例如字体、邮件账号、网站超时等。

### 7. HTTP 接口规范
- 统一响应格式：`{ code: 20000, data, msg: 'success', timestamp }`。
- 错误响应：`{ code: 50000/60000, msg, timestamp, stack? }`（开发环境返回堆栈）。
- 使用 `responseWrapper` 中间件自动包装成功响应，`errorHandler` 统一捕获异常。
- Swagger 文档：访问 `/swagger`（UI）、`/swagger.json`（原始 JSON）。
- 支持多种文档客户端：Scalar、Stoplight、RapiDoc、ReDoc、SwaggerUI 等。

### 8. WebSocket 实时通信
- 基于 Socket.IO，挂载在同一个 HTTP 服务器上。
- 客户端可订阅书籍房间（`subscribe:book`），接收该书籍相关的采集进度、更新通知等。
- 服务端通过 `EventManager` 广播事件至对应房间或全局。

---

## 四、命名规范（项目标准）

| 元素 | 风格 | 示例 |
|------|------|------|
| 目录 | kebab-case | `1-interfaces`, `http`, `web-book` |
| 类文件 | PascalCase | `BookController.js` |
| 函数/工具文件 | camelCase | `logger.js`, `databaseConnection.js` |
| 路由文件 | `{Resource}.routes.js` | `book.routes.js` |
| DTO 文件 | `{Resource}{Purpose}.dto.js` | `BookListResponse.dto.js` |
| 类名 | PascalCase | `BookQueryService` |
| 数据库字段 | snake_case | `book_name`, `created_at` |

> **为什么区分类文件和函数文件？**  
> 通过文件名即能判断文件内容，无需打开代码：`PascalCase` → 类，`camelCase` → 函数/工具。

>**为什么使用带数字的文件夹**
>强化对当前层的判断职责边界，更好的守好业务分界：`入口(1) → 业务(2) → 核心(3) ← 技术实现(4)`
>**数字越大 = 越靠近“底层技术细节”或“远离业务入口”**

### 统一动词规范（Service/Controller）
- 返回列表：`listXxx`（如 `listBooks`）
- 返回单条：`getXxx` 或 `findXxx`（如 `getBookById`）
- 复杂搜索：`searchXxx`

---

## 五、常量归属原则

| 常量类型 | 归属层 | 示例 |
| :--- | :--- | :--- |
| **业务语义**（如书名标记、采集字段名） | `3-domain/constants/` | `BookConstants.IntroductionName`, `Rule.RuleName` |
| **应用调度/协议**（如任务类型、事件名、配置分组） | `2-application/constants/`（推荐） | `TASK_TYPES`, `COLLECT_EVENTS`, `SYSTEM_DEFAULT_FONT` |
| **技术实现**（如驱动名称、超时值） | `4-infrastructure/constants/`（如有需要） | 一般直接写在实现中 |

> **原则**：领域层仅包含业务概念；技术性、调度性、配置性的常量应移至应用层，以便基础设施层导入。当前代码中部分常量位于 `3-domain/constants/` 下，计划逐步迁移至 `2-application/constants/`。

---

## 六、扩展指南：如何新增一个功能模块？

### 1. 新增领域实体（如 `User`）
- 在 `3-domain/entities/UserEntity.js` 定义 Sequelize 模型。
- 在 `3-domain/entities/index.js` 的 `entityDefinitions` 数组中追加导入。
- 在 `3-domain/associations/index.js` 中定义与其他模型的关系。

### 2. 新增仓储
- 在 `4-infrastructure/repositories/UserRepository.js` 中编写数据访问方法。
- 在 `4-infrastructure/repositories/index.js` 的 `createRepositories` 中实例化并返回。

### 3. 新增应用服务
- 在 `2-application/services/` 下创建服务类（如 `UserQueryService`、`UserCommandService`）。
- 在 `2-application/services/index.js` 的 `createServices` 中组装依赖并导出。

### 4. 新增 HTTP 接口
- 在 `1-interfaces/http/dtos/` 下定义请求/响应 DTO（含 Swagger Schema）。
- 在 `1-interfaces/http/controllers/UserController.js` 中新增方法，挂载 Swagger 注解。
- 在 `1-interfaces/http/controllers/index.js` 中显式导入并挂载。

### 5. 新增路由
- 在 `1-interfaces/http/routes/user.routes.js` 定义子路由。
- 路由文件会被 `routes/index.js` 自动扫描加载，无需手动注册（若需显式顺序，也可在 `index.js` 中手工导入）。

### 6. 新增任务类型（如需异步执行）
- 在 `2-application/constants/Task.js`（或原 `3-domain/constants/Task.js`）中定义新 `TASK_TYPES` 枚举。
- 在 `2-application/thread-assemblers/` 下创建对应的装配器（如 `userTask.assembler.js`），负责组装执行器。
- 在 `4-infrastructure/workers/tasks/assignTasks.js` 的 `switch` 中添加分支，指向该装配器。
- 在 `2-application/services/executor/` 下实现 `ITaskExecutor`，并让装配器返回其实例。

---

## 七、常见问题与注意事项

- **事务**：涉及多个仓储的操作务必使用 `ITransaction.runInTransaction`。
- **线程安全**：Worker 线程之间不共享状态，每个任务独立执行。事件通过 `EventManager.emitToMain` 传递到主线程再广播。
- **Swagger 安全码**：`60000` 系列表示用户输入错误，`50000` 表示服务器内部错误。ReDoc 等工具可能不识别非标准 HTTP 状态码，可通过 `?safehttp=1` 参数将 `600` 替换为 `default`。
- **文件上传**：使用 `koa-body` 解析 multipart，文件保存在 `ctx.request.files` 中。
- **静态文件**：通过 `staticServer` 中间件挂载，路径由配置 `repository.path` 指定。

---

## 八、启动与调试

```bash
# 安装依赖
pnpm install

# 开发模式（监听文件变化）
pnpm run dev

# 生产模式
NODE_ENV=production node src/app.js

# 配置环境变量（如覆盖端口）
PORT=3001 node src/app.js
```

访问 `http://localhost:3001/swagger` 查看 API 文档，`http://localhost:3001/asyncapi/scalar` 查看 WebSocket 文档。

