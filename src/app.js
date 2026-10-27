import { httpServer, config, initializeDatabase, closeDatabase, logger } from './system.js';

logger.info(` Ebook Workshop v${config.version}`);

const PORT = config.server.port;
await initializeDatabase();

httpServer.listen(PORT, () => {
    logger.info(`🚀 服务器已启动: http://localhost:${PORT}`);
    logger.log(`⚙️ 配置环境: ${process.env.NODE_ENV || 'development'}`);
});
const programExit = () => {
    logger.info('\n\n\n🛑 收到终止信号，正在关闭...\n\n\n');
    httpServer.close();
    closeDatabase();
    process.exit(0);
};


process.on('SIGTERM', programExit);//kill -15 结束
process.on('SIGINT', programExit); //Ctrl+C 退出
