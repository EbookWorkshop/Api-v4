// // src/1-interfaces/websocket/handlers/book.handler.js

// /**
//  * 注册书籍相关的 Socket 事件
//  * @param {Socket} socket - Socket.IO 客户端实例
//  * @param {Object} services - 注入的服务映射
//  */
// export function registerBookHandlers(socket, services) {
//   const { bookQuery, bookCommand } = services;

//   // 获取书籍列表
//   socket.on('book:list', async (params, callback) => {
//     try {
//       const data = await bookQuery.getBookList(params);
//       callback({ success: true, data });
//     } catch (err) {
//       callback({ success: false, message: err.message });
//     }
//   });

//   // 获取单本书详情
//   socket.on('book:get', async (payload, callback) => {
//     try {
//       const data = await bookQuery.getBookDetail(payload.bookId);
//       callback({ success: true, data });
//     } catch (err) {
//       callback({ success: false, message: err.message });
//     }
//   });

//   // 创建书籍
//   socket.on('book:create', async (payload, callback) => {
//     try {
//       const data = await bookCommand.createBook(payload);
//       callback({ success: true, data });
//     } catch (err) {
//       callback({ success: false, message: err.message });
//     }
//   });
// }