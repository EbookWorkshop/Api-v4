import { Log } from './Log.js';

// ✅ 模块级单例，符合 Node.js 模块缓存机制
// 它只是"持有者"，具体实现由 system.js 决定
export const logger = new Log();


