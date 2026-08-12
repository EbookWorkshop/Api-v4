# V4 Book Collector 架构描述

## 项目简介
基于 **分层架构 + 依赖注入** 的 Node.js (Koa) 电子书采集系统。严格遵循 **洋葱模型**，内层（Domain）不依赖外层（Infrastructure），通过组合根（`system.js`）集中组装依赖。

## 核心设计原则
1. **依赖方向**：`1-interfaces` → `2-application` → `3-domain` ← `4-infrastructure`
2. **控制反转**：所有 `new` 操作只在组合根及各层桶文件中执行
3. **显式优于隐式**：模型注册、路由加载均使用桶文件
4. **配置多层覆盖**：`default.js` → `{env}.js` → `local.js` → 环境变量
5. **CQS（命令查询分离）**：Query 和 Command 使用独立的 Service 类
6. **HTTP 层四阶段挂载**：前置中间件 → 功能端点 → 后置包装器 → 业务路由

## 命名规范
| 元素 | 风格 | 示例 |
|------|------|------|
| 目录 | kebab-case | `1-interfaces`, `http` |
| 类文件 | PascalCase | `BookController.js` |
| 函数/工具文件 | camelCase | `logger.js`, `databaseConnection.js` |
| 路由文件 | {Resource}.routes.js | `book.routes.js` |
| DTO 文件 | {Resource}{Purpose}.dto.js | `BookListResponse.dto.js` |
| 类名 | PascalCase | `BookQueryService` |
| 数据库字段 | snake_case | `book_name`, `created_at` |

## 目录层级与职责
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

## HTTP 层挂载顺序（四阶段）
```
请求进入
  ↓
[1. 前置中间件] ErrorHandler → CORS → Logger → BodyParser
  ↓
[2. 功能端点] StaticServer → SwaggerUI（匹配则提前返回）
  ↓
[3. 后置中间件] ResponseWrapper（包装 JSON 响应）
  ↓
[4. 业务路由] Router → Controller → Service → Repository
  ↓
响应返回
```

## 运行方式
```bash
npm install
npm start   # 或 npm run dev
```

## 版本信息
- **架构版本**: V4.0
- **对应脚本**: init-v4-project.sh
- **升级说明**: 统一路由文件命名（{Resource}.routes.js），引入 DTO components 共享区，四阶段 HTTP 挂载
