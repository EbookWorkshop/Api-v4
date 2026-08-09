import { app, config, initializeDatabase } from './system.js';

const PORT = config.server.port;

await initializeDatabase();

app.listen(PORT, () => {
  console.log(`🚀 服务器已启动: http://localhost:${PORT}`);
  console.log(`📖 测试 API: http://localhost:${PORT}/api/books`);
  console.log(`💚 健康检查: http://localhost:${PORT}/api/health`);
  console.log(`⚙️  环境: ${process.env.NODE_ENV || 'development'}`);
});

process.on('SIGTERM', () => {
  console.log('🛑 收到终止信号，正在关闭...');
  process.exit(0);
});
