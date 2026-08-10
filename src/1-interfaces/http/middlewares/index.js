import { createErrorHandlerMiddleware } from './errorHandler.js';
import { createLoggerMiddleware } from './logger.js';
import { createResponseWrapperMiddleware } from './responseWrapper.js';

export function registerMiddlewares(app, config) {
  // 洋葱模型：从外到内
  app.use(createErrorHandlerMiddleware());
  app.use(createLoggerMiddleware(config));
  app.use(createResponseWrapperMiddleware());
  // 新增：app.use(createAuthMiddleware(config));
}
