import { httpServer, config, initializeDatabase, closeDatabase } from './system.js';

console.log(` Ebook Workshop v${config.version}`);

const PORT = config.server.port;
await initializeDatabase();

httpServer.listen(PORT, () => {
    console.log(`🚀 服务器已启动: http://localhost:${PORT}`);
    console.log(`⚙️ 配置环境: ${process.env.NODE_ENV || 'development'}`);
});
const programExit = () => {
    console.log('\n\n\n🛑 收到终止信号，正在关闭...\n\n\n');
    httpServer.close();
    closeDatabase();
    process.exit(0);
};


process.on('SIGTERM',programExit);//kill -15 结束
process.on('SIGINT',programExit); //Ctrl+C 退出
