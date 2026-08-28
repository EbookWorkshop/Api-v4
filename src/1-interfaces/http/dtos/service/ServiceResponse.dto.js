/**
 * @swagger
 * components:
 *   schemas:
 *     CpuInfo:
 *       type: object
 *       description: CPU 信息
 *       properties:
 *         model:
 *           type: string
 *           description: CPU 型号
 *           example: "Intel(R) Pentium(R) CPU  J3710  @ 1.60GHz"
 *
 *     PackageVersionEntry:
 *       type: object
 *       description: 单个依赖包的版本信息（不同包可能包含额外字段）
 *       properties:
 *         version:
 *           type: string
 *           description: 当前安装版本
 *           example: "15.7.0"
 *         resolved:
 *           type: string
 *           description: 包来源路径
 *           example: "file:../.pnpm/@koa+router@15.7.0_koa@3.2.1/node_modules/@koa/router"
 *         overridden:
 *           type: boolean
 *           description: 是否被覆盖
 *           example: false
 *         current:
 *           type: string
 *           description: 当前版本（仅部分包存在）
 *           example: "0.35.3"
 *         wanted:
 *           type: string
 *           description: 期望版本（仅部分包存在）
 *           example: "0.35.4"
 *         latest:
 *           type: string
 *           description: 最新版本（仅部分包存在）
 *           example: "0.35.4"
 *         dependent:
 *           type: string
 *           description: 依赖者（仅部分包存在）
 *           example: "Api"
 *         location:
 *           type: string
 *           description: 安装路径（仅部分包存在）
 *           example: "/home/coco/Project/EBW/Api/node_modules/sharp"
 *       additionalProperties: true   # 允许其他未列出的字段
 *
 *     VersionInfo:
 *       type: object
 *       description: 系统版本信息
 *       properties:
 *         version:
 *           type: string
 *           description: 应用版本号
 *           example: "3.12.3"
 *         packageVersion:
 *           type: object
 *           additionalProperties:
 *             $ref: '#/components/schemas/PackageVersionEntry'
 *           description: 依赖包版本信息，键为包名
 *           example:
 *             "@koa/router": { version: "15.7.0", resolved: "...", overridden: false }
 *             "sharp": { version: "0.35.3", resolved: "...", overridden: false, current: "0.35.3", wanted: "0.35.4", latest: "0.35.4", dependent: "Api", location: "..." }
 *         dataPath:
 *           type: string
 *           description: 数据存储路径
 *           example: "/home/coco/Project/EBW/MyLibrary"
 *         databaseSize:
 *           type: integer
 *           description: 数据库大小（字节）
 *           example: 210264064
 *         nodeVersion:
 *           type: string
 *           description: Node.js 版本
 *           example: "v24.19.0"
 *         osType:
 *           type: string
 *           description: 操作系统类型
 *           example: "Linux"
 *         osRelease:
 *           type: string
 *           description: 操作系统发行版本
 *           example: "7.0.0-30-generic"
 *         cpu:
 *           type: array
 *           items:
 *             $ref: '#/components/schemas/CpuInfo'
 *           description: CPU 信息列表
 *         memFree:
 *           type: string
 *           description: 可用内存（GB）
 *           example: "1.93"
 *         memTotal:
 *           type: string
 *           description: 总内存（GB）
 *           example: "7.16"
 *       required:
 *         - version
 *         - dataPath
 *         - databaseSize
 *         - nodeVersion
 *         - osType
 *         - osRelease
 *         - cpu
 *         - memFree
 *         - memTotal
 *
 *     VersionInfoResponse:
 *       allOf:
 *         - $ref: '#/components/schemas/ApiResponse'
 *         - type: object
 *           properties:
 *             data:
 *               $ref: '#/components/schemas/VersionInfo'
 *       required:
 *         - data
 *
 *   examples:
 *     VersionInfoSuccess:
 *       summary: 版本信息成功响应示例
 *       value:
 *         code: 20000
 *         msg: "success"
 *         timestamp: "2026-08-28T10:00:00.000Z"
 *         data:
 *           version: "3.12.3"
 *           packageVersion:
 *             "@koa/router":
 *               version: "15.7.0"
 *               resolved: "file:../.pnpm/@koa+router@15.7.0_koa@3.2.1/node_modules/@koa/router"
 *               overridden: false
 *             sharp:
 *               version: "0.35.3"
 *               resolved: "file:.pnpm/sharp@0.35.3/node_modules/sharp"
 *               overridden: false
 *               current: "0.35.3"
 *               wanted: "0.35.4"
 *               latest: "0.35.4"
 *               dependent: "Api"
 *               location: "/home/coco/Project/EBW/Api/node_modules/sharp"
 *           dataPath: "/home/coco/Project/EBW/MyLibrary"
 *           databaseSize: 210264064
 *           nodeVersion: "v24.19.0"
 *           osType: "Linux"
 *           osRelease: "7.0.0-30-generic"
 *           cpu:
 *             - model: "Intel(R) Pentium(R) CPU  J3710  @ 1.60GHz"
 *             - model: "Intel(R) Pentium(R) CPU  J3710  @ 1.60GHz"
 *             - model: "Intel(R) Pentium(R) CPU  J3710  @ 1.60GHz"
 *             - model: "Intel(R) Pentium(R) CPU  J3710  @ 1.60GHz"
 *           memFree: "1.93"
 *           memTotal: "7.16"
 */