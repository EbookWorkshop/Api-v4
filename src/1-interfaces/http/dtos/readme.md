## 项目 Swagger 注解生成规范（通用提示词模板）

### 1. 项目背景
- **框架**：基于 Koa（或任意 Node.js 框架），使用 `swagger-jsdoc` 通过 JSDoc 注释生成 OpenAPI 3.0 文档。
- **响应统一包装**：所有接口返回的数据均由全局中间件装饰为以下结构：
  ```json
  {
    "code": 20000,       // 业务状态码，通常为 HTTP 状态码 * 100
    "data": {},          // 实际业务数据
    "msg": "success",    // 提示信息
    "timestamp": "2026-08-13T12:00:00.000Z"
  }
  ```
  错误响应也遵循相同结构，`code` 对应错误码，`msg` 包含错误信息。

### 2. 文档组织结构
- **DTO 文件位置**：所有 Schema、参数、示例等 Swagger 组件定义，统一放在 `src/1-interfaces/http/dtos/` 目录下，按业务模块拆分独立的 `.dto.js` 文件。
- **控制器文件位置**：`src/1-interfaces/http/controllers/`，控制器中仅保留接口路径、方法、参数引用、响应引用的注解，不重复书写 Schema 或示例的详细内容。

### 3. 组件定义要求
- **基础响应 Schema**：定义 `ApiResponse` 作为所有响应的基础模型，包含 `code`、`msg`、`timestamp` 字段（类型、描述、示例）。
- **业务响应 Schema**：针对每个接口，通过 `allOf` 组合 `ApiResponse` 与具体的 `data` 字段定义，形成该接口的专属响应 Schema（如 `BookListResponse`）。
- **查询参数组件**：将常用的查询参数（如 `tagid`、`nottag`）定义为 `parameters` 组件，以便在多个接口中复用。
- **示例组件**：将完整的响应示例（包含外层包装和 data 内容）定义为 `examples` 组件，并在控制器的 `responses` 中通过 `$ref` 引用，避免重复书写 JSON。

### 4. 具体实现要求（以图书列表接口为例）
- **接口路径**：`GET /library/booklist`
- **查询参数**：
  - `tagid`（可选，整数）：包含指定标签 ID。
  - `nottag`（可选，字符串，逗号分隔数字）：排除指定标签 ID。
- **业务数据**：图书列表数组，每个对象包含 `id`、`BookName`、`Author`、`CoverImg`（可空）、`Hotness`、`TotalWord`、`createdAt`、`updatedAt`。
- **文档要求**：
  - 在 DTO 文件中定义 `BookListItem` Schema、`BookListResponse` Schema（继承 `ApiResponse`）、查询参数组件、examples 组件（如有）、响应示例组件（包括成功有数据和空数据两种场景）。
  - 在控制器中只引用这些组件，不写重复细节。
  - 确保 `swagger-jsdoc` 扫描路径包含 DTO 目录。

### 5. 输出格式
- 提供完整的 JSDoc 注释代码，分别放在对应的 DTO 文件和控制器文件中。
- 明确说明每个文件应放置的内容，以及 `swagger-jsdoc` 配置的扫描路径调整。

### 6. 额外约束
- 示例中的时间字段使用 `format: date-time`。
- 可空字段（如 `CoverImg`）标记 `nullable: true`。
- 错误响应（400、500）只需简要描述，不必定义详细示例（除非需要）。
