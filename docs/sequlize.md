### 🔍 查询类 (Finder Methods) - 对应 SQL `SELECT`

这类方法用于从数据库中读取数据。

| 方法 | 描述 | 对应SQL概念 |
| :--- | :--- | :--- |
| `findAll()` | 查询所有匹配的记录，是最基础的查询方法。 | `SELECT * FROM ...` |
| `findByPk()` | 通过**主键 (Primary Key)** 查询单条记录。 | `SELECT ... WHERE primary_key = ...` |
| `findOne()` | 查询满足条件的第一条记录。 | `SELECT ... LIMIT 1` |
| `findOrCreate()` | 查找记录，如果不存在则创建一条新记录。 | 查找不到则 `INSERT` |
| `findAndCountAll()` | 同时返回匹配的记录列表和总记录数，常用于分页。 | `SELECT ... LIMIT ... OFFSET ...` + `COUNT(*)` |

> 所有查询方法都支持 `where` 等参数来精确筛选数据。

### ✍️ 创建类 (Creation Methods) - 对应 SQL `INSERT`

用于向数据库中添加新数据。

| 方法 | 描述 | 对应SQL概念 |
| :--- | :--- | :--- |
| `create()` | 创建并保存一个新实例到数据库。 | `INSERT INTO ...` |
| `bulkCreate()` | 一次性批量创建并保存多个实例。 | 批量 `INSERT` |

### 🔧 更新类 (Update Methods) - 对应 SQL `UPDATE`

用于修改数据库中的已有数据。

| 方法 | 描述 | 对应SQL概念 |
| :--- | :--- | :--- |
| `update()` | 批量更新满足条件的记录。 | `UPDATE ... SET ... WHERE ...` |
| `increment()` | **原子性**地增加一个或多个字段的值，避免并发问题。 | `UPDATE ... SET field = field + 1` |
| `decrement()` | **原子性**地减少一个或多个字段的值。 | `UPDATE ... SET field = field - 1` |
| `restore()` | 恢复一个被软删除（`paranoid`）的记录。 | `UPDATE ... SET deletedAt = NULL` |

### 🗑️ 删除类 (Delete Methods) - 对应 SQL `DELETE`

用于移除数据库中的数据。

| 方法 | 描述 | 对应SQL概念 |
| :--- | :--- | :--- |
| `destroy()` | 删除满足条件的记录。如果模型开启了`paranoid`，则为软删除。 | `DELETE FROM ...` 或软更新 `deletedAt` |

### ⚙️ 其他实用方法 (Utility Methods)

这些方法用于执行一些辅助或管理任务。

| 方法 | 描述 | 对应SQL概念 |
| :--- | :--- | :--- |
| `count()` | 统计满足条件的记录总数。 | `SELECT COUNT(*) ...` |
| `max()` / `min()` | 获取指定字段的最大值或最小值。 | `SELECT MAX(field) ...` / `SELECT MIN(field) ...` |
| `sum()` | 计算指定字段的总和。 | `SELECT SUM(field) ...` |
| `sync()` | 将模型与数据库同步，会根据模型定义创建或修改表结构。 | `CREATE TABLE ...` / `ALTER TABLE ...` |
| `drop()` | 删除模型对应的数据库表。 | `DROP TABLE ...` |

### 📋 实例方法 (Instance Methods) - 操作单条记录

当你通过查询获取到一个**模型实例（代表一行数据）**后，可以使用以下方法：

| 方法 | 描述 |
| :--- | :--- |
| `save()` | 保存当前实例的所有更改到数据库。 |
| `update()` | 更新当前实例的特定字段并保存。 |
| `destroy()` | 删除当前实例所代表的记录。 |
| `reload()` | 从数据库重新加载当前实例的最新数据。 |
| `get()` / `set()` | 获取或设置实例的属性值。 |

### 📚 查阅技巧

*   **首选官方文档**：Sequelize 的[官方API文档](https://sequelize.org/api/v6/class/src/model.js~model.html)是最完整、最权威的来源。
*   **按功能模块查阅**：官方指南将方法按功能分组，例如 [Model Querying - Finders](https://sequelize.org/docs/v6/core-concepts/model-querying-finders/) 专门介绍查询方法，非常便于学习。
*   **善用搜索引擎**：遇到不确定的方法时，可以直接搜索 `Sequelize [方法名]` 或 `Sequelize [操作描述]`，通常能快速找到答案。

