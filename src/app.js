import { httpServer, config, initializeDatabase } from './system.js';
import { Server as SocketIO } from 'socket.io';

const PORT = config.server.port;

await initializeDatabase();

httpServer.listen(PORT, () => {
  console.log(`🚀 服务器已启动: http://localhost:${PORT}`);
  console.log(`⚙️ 配置环境: ${process.env.NODE_ENV || 'development'}`);
});

process.on('SIGTERM', () => {
  console.log('🛑 收到终止信号，正在关闭...');
  process.exit(0);
});
