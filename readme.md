# V4 Book API V4.0 -- 开发蓝图

## 一、项目概览
之前纯手搓的项目架构（v3）从软件工程的角度看显得混乱，除了继续加功能没什么值得学习的了。所以现在尝试用新的项目架构重构整个后台。
新采用的架构是一个基于 **分层架构 + 依赖注入** 的 Node.js (Koa) 电子书采集系统。它严格遵循 **洋葱模型（Onion Architecture）**，内层（Domain）不依赖外层（Infrastructure），通过组合根（`system.js`）集中组装依赖。

### 核心设计原则

| 原则 | 说明 |
| :--- | :--- |
| **依赖倒置** | `1-interfaces` → `2-application` → `3-domain` ← `4-infrastructure`（内层绝不依赖外层） |
| **控制反转** | 所有 `new` 操作只在 `src/system.js` 及各层桶文件中执行，业务代码不直接实例化依赖 |
| **显式优于隐式** | 模型注册（桶文件）~~、路由加载（聚合器）~~均显式声明，不采用文件扫描 |
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

| 元素 | 风格 | 示例 |
|------|------|------|
| 目录 | kebab-case | `1-interfaces`, `http` |
| 类文件 | PascalCase | `BookController.js` |
| 函数/工具文件 | camelCase | `logger.js`, `databaseConnection.js` |
| 路由文件 | {Resource}.routes.js | `book.routes.js` |
| DTO 文件 | {Resource}{Purpose}.dto.js | `BookListResponse.dto.js` |
| 类名 | PascalCase | `BookQueryService` |
| 数据库字段 | snake_case | `book_name`, `created_at` |

> 数据库从旧项目沿用下来，相关命名不再变更。    

### 为什么（类 vs 函数）？
这是为了**通过“文件名”就能快速判断文件内容**，无需打开看代码：

- 看到 `BookController.js`（大驼峰） → 立即知道里面是一个 `class BookController {}`。
- 看到 `logger.js`（小驼峰） → 立即知道里面是一个 `function logger()` 或 `export const createLogger = () => {}`。

### 层级命名规范
#### Service、Controller
统一动词用于描述返回类型：
* 返回列表：listXxx（如 listBooks）
* 返回单条：getXxx 或 findXxx（如 getBookById）
* 复杂搜索：searchXxx


## 三、项目目录结构
```
src/                                       # 源码根目录
│
├── 1-interfaces/                          # 接口适配层（对外暴露的协议适配）
│   ├── http/                              # HTTP 协议适配
│   │   ├── controllers/                   # 控制器：接收请求、调用应用服务、返回响应
│   │   ├── dtos/                          # 数据传输对象（请求/响应结构 + Swagger 注解）
│   │   │   ├── components/                # 公共组件 DTO（如 BookIdRequest, ApiResponse）
│   │   │   └── ……/                        # 各个领域的 DTO
│   │   ├── middlewares/                   # Koa 中间件（错误处理、日志、CORS、响应包装、静态文件）
│   │   └── routes/                        # 路由定义（每个文件对应一个控制器模块的路由）
│   └── websocket/                         # WebSocket 协议适配
│       ├── handlers/                      # Socket 事件处理器（注册业务事件）
│       └── index.js                       # WebSocket 服务器装配
│
├── 2-application/                         # 应用层（用例编排、业务服务、端口定义）
│   ├── dto/                               # 应用层数据传输对象（供服务间或线程传递）
│   ├── orchestrators/                     # 编排器（监听领域事件，协调多个服务完成复杂流程，如导出流程）
│   ├── ports/                             # 端口（抽象接口，定义基础设施必须实现的能力，如 IEmailSender, IFileScanner）
│   ├── services/                          # 应用服务（具体业务用例实现）
│   │   ├── executor/                      # 任务执行器（实现 ITaskExecutor，用于线程池执行）
│   │   └── index.js                       # 服务组装工厂
│   └── thread-assemblers/                 # 工作线程专用装配器（为子线程组装独立的服务实例）
│
├── 3-domain/                              # 领域层（业务核心概念、规则、常量）
│   ├── associations/                      # 模型关联定义（Sequelize 关系映射）
│   │   └── scope.js                       # 模型作用域（默认查询范围）
│   ├── constants/                         # 领域常量（事件名称、任务类型、系统配置分组、图书标记等）
│   └── entities/                          # 领域实体（Sequelize 模型定义，对应数据表结构）
│
├── 4-infrastructure/                      # 基础设施层（技术实现，依赖外部组件）
│   ├── cache/                             # 缓存实现（内存缓存）
│   ├── config/                            # 配置加载器（加载 default/环境/local.js 及环境变量）
│   ├── container/                         # 轻量级容器（用于子线程快速构建核心依赖）
│   ├── database/                          # 数据库连接、事务管理
│   ├── email/                             # 邮件发送实现（基于 Nodemailer）
│   ├── event/                             # 事件管理器（封装 EventEmitter，支持跨线程转发）
│   ├── repositories/                      # 数据仓储实现（封装 Sequelize 模型操作，提供领域对象持久化）
│   ├── server/                            # 服务器相关基础设施
│   │   ├── adapters/                      # 适配器（文件系统扫描、写入，实现端口接口）
│   │   ├── drivers/                       # 底层驱动（文件系统底层操作函数）
│   │   ├── generators/                    # 导出文件生成器（Epub、Pdf、Txt）及工厂
│   │   └── ServiceServer.js               # 系统信息服务（获取版本、系统状态）
│   └── workers/                           # 多线程支持
│       ├── pool/                          # 线程池（WorkerPool, WorkerQueue）
│       ├── runner/                        # 工作线程入口（run.js 不带数据库，runOnDB.js 带数据库）
│       └── tasks/                         # 任务定义（Task 类）和任务分配器（assignTasks）
│
├── 5-shared/                              # 共享工具与通用错误
│   ├── errors/                            # 自定义错误类（AppError, UserInputError）
│   └── utils/                             # 通用工具函数（文件大小格式化等）
│
├── app.js                                 # 应用启动入口（启动 HTTP 服务器）
└── system.js                              # 系统组装核心（加载配置、初始化数据库、组装依赖、创建控制器/服务/HTTP/WS）
```

### 目录层级与职责
| 层级 | 目录 | 职责 |
|------|------|------|
| 1-interfaces | `http/controllers` | HTTP 协议适配，处理 ctx，挂载 Swagger 注解 |
| | `http/dtos/components` | 可复用的数据结构片段（BookSummary, TagInfo） |
| | `http/dtos/{module}` | 各模块请求/响应结构（含 Swagger schema） |
| | `http/routes` | 路由映射（{Resource}.routes.js） |
| | `http/middlewares` | 错误处理、CORS、日志、响应包装、静态文件 |
| 2-application | `services` | 业务用例编排（Query/Command 分离） |
| 3-domain | `entities` | 纯数据定义（Sequelize 模型） |
| | `associations` | 模型关系定义 |
| | `constants` | 业务常量 |
| 4-infrastructure | `config` | 配置加载器 |
| | `database` | 数据库连接工厂 |
| | `repositories` | 具体 SQL/ORM 操作 |
| 5-shared | `errors` | 自定义异常类 |
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



