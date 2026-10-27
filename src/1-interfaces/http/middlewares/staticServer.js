import path from 'node:path';
import staticServer from 'koa-static';
import { logger } from '../../../5-shared/logging/index.js';

/**
 * 注册静态文件服务
 */
export function createStaticServer(config) {
    const spath = config.repository?.path;
    const staticPath = path.resolve(process.cwd(), spath);
    if (config.debug.mode) logger.debug(`📁 静态文件服务已挂载: ${staticPath} `);
    return staticServer(staticPath);
}