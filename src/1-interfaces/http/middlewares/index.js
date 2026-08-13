//中间件层： “必须拦截每一个请求” 的横切关注点。
//我的理解：这层负责拦截每一个请求的响应，就可以放在中间件层
//区别于『静态文件服务』、『swagger』，它们只拦截、响应部分路由请求，职责层级应该与router类是

import { createErrorHandlerMiddleware } from './errorHandler.js';
import { createLoggerMiddleware } from './logger.js';
import { createResponseWrapperMiddleware } from './responseWrapper.js';
import { createCorsMiddleware } from './cors.js';
export { createStaticServer } from "./staticServer.js"

/**
 * 逻辑处理之前响应的中间件
 * @param {*} app 
 * @param {*} config 
 */
export function registerPreResponseMiddlewares(app, config) {
  // 洋葱模型：从外到内
  app.use(createErrorHandlerMiddleware(config));
  app.use(createCorsMiddleware());
  app.use(createLoggerMiddleware(config));
}

/**
 * 逻辑处理过后响应的中间件
 * @param {*} app 
 * @param {*} config 
 */
export function registerPostResponseMiddlewares(app, config) {
  app.use(createResponseWrapperMiddleware());
}