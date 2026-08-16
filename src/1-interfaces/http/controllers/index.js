// src/1-interfaces/http/controllers/index.js
import { BookController } from './BookController.js';
import { VolumeController } from "./VolumeController.js"
import { ChapterController } from './ChapterController.js';
import { TagController } from './TagController.js';
import { FontController } from "./FontController.js";
import { WebBookController } from "./WebBookController.js"
import { SwaggerController } from "./SwaggerController.js"

/**
 * 
 * @param {*} services 
 * @returns 
 */
export function createControllers(services, config) {
  const { bookQuery, bookCommand, bookDetailQuery } = services;
  const { tagQuery } = services;

  //注意：路由聚合器的设计要求了，路由对应的控制器必须是路由模块名字的小骆峰名字。即：abcRouter必须对应的控制器为abc。
  return {
    book: new BookController(bookQuery, bookCommand, bookDetailQuery),
    webBook: new WebBookController(services.webBookQuery, null, services.webBookDetailQuery),
    volume: new VolumeController(services.volumeQuery),
    chapter: new ChapterController(services.chapterQuery),
    tag: new TagController(tagQuery),
    font: new FontController(services.font, null),
    swagger: new SwaggerController(config),
  };
}
