import path from 'node:path';
import staticServer from 'koa-static';

/**
 * 注册静态文件服务
 */
export function createStaticServer(config) {
    const spath = "../MyLibrary";       //TODO：从配置文件上读取
    const staticPath = path.resolve(process.cwd(), spath);
    console.log(`📁 静态文件服务已挂载: ${staticPath} `);
    return staticServer(staticPath);
}