import { Server } from 'socket.io';
import { registerAllClientEvents, registerAllGlobalBroadcasts } from './handlers/index.js';

export function setupWebsocket(httpServer, services, eventManager) {
    const io = new Server(httpServer, { cors: { origin: '*' } });

    // 1. 注册全局广播（只执行一次）
    registerAllGlobalBroadcasts(io, services, eventManager);

    // 2. 处理客户端连接
    io.on('connection', (socket) => {
        console.log(`[⇅] Client connected: ${socket.id}`);
        
        // 注册所有客户端事件（每个连接独立）
        registerAllClientEvents(socket, services, eventManager);

        socket.on('disconnect', () => {
            console.log(`[⇅] Client disconnected: ${socket.id}`);
        });
    });

    return io;
}