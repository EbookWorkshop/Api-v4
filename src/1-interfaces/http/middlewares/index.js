

import { createErrorHandlerMiddleware } from './errorHandler.js';
import { createLoggerMiddleware } from './logger.js';
import { initStaticServer } from './staticServer.js';
import { createResponseWrapperMiddleware } from './responseWrapper.js';
import { createCorsMiddleware } from './cors.js';

export function registerMiddlewares(app, config) {
  // 洋葱模型：从外到内
  app.use(createErrorHandlerMiddleware(config));
  app.use(createCorsMiddleware());
  app.use(createLoggerMiddleware(config));
  app.use(initStaticServer(config));//需要在下面的包装之前
  app.use(createResponseWrapperMiddleware());
}
