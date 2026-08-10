// src/1-interfaces/http/controllers/index.js
import { BookController } from './BookController.js';
// 未来新增：import { UserController } from './UserController.js';

/**
 * 控制器工厂（统一组装所有 Controller）
 * 新增 Controller 时：在此导入，并在 return 对象中添加一行即可
 */
export function createControllers(services) {
  const { bookQuery, bookCommand } = services;

  return {
    book: new BookController(bookQuery, bookCommand),
    // 新增：user: new UserController(services.user),
  };
}
