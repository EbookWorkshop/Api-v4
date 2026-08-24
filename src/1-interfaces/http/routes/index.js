import Router from '@koa/router';
import { readdirSync } from "node:fs";

/**
 * 
 * @param {*} controllers 
 * @returns 
 */
export function createMainRouter(controllers) {
  const router = new Router();//{ prefix: '/api' }
  //自动装载当前目录的所有路由
  //与之前的手工装载路由比，丢失了特性：
  // 1、人工安排路由顺序；
  // 2、按文件排除路由；
  // 3、路由与控制器之间的名字人工关联（可以做控制器复用）；
  //如果追求1、2特性，可以将readdir改为手工排版的一个文件名数组，将需要导入的路由按需求顺序加载。
  const files = readdirSync(import.meta.dirname);
  for (const mf of files) {
    if (!mf.endsWith(".routes.js")) continue;

    const moduleName = mf.replace(".routes.js", "");
    if (controllers[moduleName] === undefined) {
      console.warn(`路由【${mf}】没有对应的控制器，请注意修改：[src/1-interfaces/http/controllers/index.js]，并导出一个含【${moduleName}】的控制器。`);
    }

    import(`./${mf}`).then(module => {
      Object.keys(module).forEach(method => {
        if (typeof (module[method]) !== "function") return;
        const thisRouter = module[method](controllers[moduleName]);
        router.use(thisRouter.routes());
        router.use(thisRouter.allowedMethods());
      })
    }).catch(error => {
      console.warn(`装载路由【./${mf}】失败，请检查相关文件。\n原因：\n${error.stack}`);
    });
  }

  // 健康检查
  router.get('/health', (ctx) => {
    ctx.body = { status: 'ok', timestamp: new Date().toISOString() };
  });

  return router;
}