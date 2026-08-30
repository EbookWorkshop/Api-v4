// src/1-interfaces/websocket/handlers/index.js
import { registerServerHandlers } from "./service.handler.js";

/**
 * 注册所有 Socket 业务事件（桶文件聚合器）
 */
export function registerAllHandlers(socket, services) {
  registerServerHandlers(socket, services);

  //   registerBookHandlers(socket, services);
  // registerRoomHandlers(socket, services);
}