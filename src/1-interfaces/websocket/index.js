// WebSocket 协议适配层
import { Server } from 'socket.io';
import { registerAllHandlers } from './handlers/index.js';

/**
 * WebSocket 层装配器（接口适配层）
 * 职责：创建 Socket.IO 服务器，注册事件 Handler，将业务服务注入给事件处理函数
 * @param {http.Server} httpServer - Node.js 原生 HTTP 服务器
 * @param {Object} services - 从组合根传入的 Service 映射
 * @returns {Server} io 实例（可导出供测试或广播使用）
 */
export function setupWebsocket(httpServer, services) {
    const io = new Server(httpServer, {
        cors: {
            origin: '*', // 生产环境请换成具体域名
            methods: ['GET', 'POST'],
        },
        // 其他配置：pingTimeout, transports 等
    });

    // 1. 全局 Socket 中间件（例如：认证鉴权）
    // 注意：这是 Socket.IO 自己的中间件，不是 Koa 中间件
    // io.use((socket, next) => { ... });

    // 2. 监听连接事件
    io.on('connection', (socket) => {
        console.log(`[Socket] Client connected: ${socket.id}`);

        // 3. 注册业务事件处理器（将服务注入进来）
        // 这里通过工厂函数将 Service 实例注入到 Handler 中
        registerAllHandlers(socket, services);

        // 4. 监听断开连接
        socket.on('disconnect', () => {
            console.log(`[Socket] Client disconnected: ${socket.id}`);
        });
    });

    return io;
}