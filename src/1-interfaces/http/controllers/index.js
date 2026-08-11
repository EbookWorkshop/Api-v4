// src/1-interfaces/http/controllers/index.js
import { BookController } from './BookController.js';
import { ChapterController } from './ChapterController.js';
import { TagController } from './TagController.js';
import { FontController } from "./FontController.js";
import { WebBookController } from "./WebBookController.js"

/**
 * 控制器工厂（统一组装所有 Controller）
 * 新增 Controller 时：在此导入，并在 return 对象中添加一行即可
 */
export function createControllers(services) {
  const { bookQuery, bookCommand, bookDetailQuery } = services;
  const { tagQuery } = services;

  return {
    book: new BookController(bookQuery, bookCommand, bookDetailQuery),
    webBook: new WebBookController(services.webBookQuery),
    chapter: new ChapterController(services.chapterQuery),
    tag: new TagController(tagQuery),
    font: new FontController(services.font, null),
  };
}
