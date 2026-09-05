import { readdirSync } from 'node:fs';
import path from 'node:path';
import { fileURLToPath } from 'node:url';

const __dirname = path.dirname(fileURLToPath(import.meta.url));
const files = readdirSync(__dirname).filter(f => f.endsWith('.handler.js'));

/**
 * 加载所有 handler 文件，分别注册客户端事件和全局广播
*/
export async function registerAllClientEvents(socket, services, eventManager) {
    for (const file of files) {
        const module = await import(`./${file}`);
        module?.registerSocketEvents(socket, services, eventManager);
    }
}

export async function registerAllGlobalBroadcasts(io, services, eventManager) {
    for (const file of files) {
        const module = await import(`./${file}`);
        module?.registerGlobalBroadcasts(io, services, eventManager);
    }
}