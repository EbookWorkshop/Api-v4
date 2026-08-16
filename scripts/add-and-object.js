import fs from 'node:fs';
import path from 'node:path';
import { fileURLToPath } from 'node:url';

/**
 * 用于自动化创建一套对象
 * 输入对象名，在1、2、4层创建一套基础对象文件。
 */

const __dirname = process.env.PWD;
const oName = process.argv[2];   //对象名

if (!oName) {
  console.log("需要通过参数输入对象名。");
  process.exit();
}
const [f, ...n] = oName;
const _ObjName = f.toUpperCase() + n.join("");
const _objName = f.toLowerCase() + n.join("");

const d1c = path.resolve(__dirname, "src/1-interfaces/http/controllers");
const d1d = path.resolve(__dirname, "src/1-interfaces/http/dtos");
const d1r = path.resolve(__dirname, "src/1-interfaces/http/routes");
const d2 = path.resolve(__dirname, "src/2-application/services")
const d4 = path.resolve(__dirname, "src/4-infrastructure/repositories")

//controller
const fController = `
import { ${_ObjName}QueryService } from "../../../2-application/services/${_ObjName}QueryService.js";
import { AppError } from '../../../5-shared/errors/AppError.js';

export class ${_ObjName}Controller {
    #${_objName}QueryService;

    /**
     * @param {${_ObjName}QueryService} ${_objName}QueryService 
     */
    constructor(${_objName}QueryService) {
        this.#${_objName}QueryService = ${_objName}QueryService;
    }
    //TODO: 加入控制器，加入注解
    async get${_ObjName}(ctx) {
        const ？？？ = ctx.query.？？？ * 1;
        if (isNaN(？？？)) throw new AppError("提供的【？？参数】不正确。", 600);
        ctx.body =await this.#${_objName}QueryService.findAll？？？(？？？)
    }
}`
const c1p = path.resolve(d1c, `${_ObjName}Controller.js`);
try {
  fs.writeFileSync(c1p, fController, { flag: 'wx' });
  fs.appendFileSync(path.resolve(__dirname, "src/1-interfaces/http/controllers/index.js"), `
console.warn("TODO: 控制器桶文件注册控制器 // src/1-interfaces/http/controllers/index.js")  
/*
import { ${_ObjName}Controller } from "./${_ObjName}Controller.js"
${_objName}: new ${_ObjName}Controller(services.${_objName}Query),//参考
*/`);
} catch (err) {
  if (err.code === 'EEXIST') {
    console.log('文件已存在，跳过写入:', c1p);
  } else {
    console.error('写入发生其他错误:', c1p, err);
  }
}

//dto
const d1dD = path.resolve(d1d, `${_objName}`);
fs.mkdirSync(d1dD, { recursive: true });
const dtoFile = path.resolve(d1dD, `${_ObjName}Response.dto.js`);
try {
  fs.writeFileSync(dtoFile, `/**
 * @swagger
 */`, { flag: 'wx' });
} catch (err) {
  if (err.code === 'EEXIST') {
    console.log('文件已存在，跳过写入:', dtoFile);
  } else {
    console.error('写入发生其他错误:', dtoFile, err);
  }
}

//route
const routeFile = path.resolve(d1r, `${_objName}.routes.js`);
try {
  fs.writeFileSync(routeFile, `import { ${_ObjName}Controller } from "../controllers/${_ObjName}Controller.js"
  import Router from '@koa/router';
  
  /**
   * @param {${_ObjName}Controller} ${_objName}Controller 
   * @returns 
   */
  export function create${_objName}Routes(${_objName}Controller) {
      const router = new Router({ prefix: '/' });//TODO: 设置路由前缀
      router.get('/', (ctx) => ${_objName}Controller.query${_ObjName}(ctx));    //设子路由与控制器之间的关联
  
      return router;
  }`, { flag: 'wx' });
} catch (err) {
  if (err.code === 'EEXIST') {
    console.log('文件已存在，跳过写入:', routeFile);
  } else {
    console.error('写入发生其他错误:', routeFile, err);
  }
}

//2/service
const serviceFille = path.resolve(d2, `${_ObjName}QueryService.js`);
try {
  fs.writeFileSync(serviceFille, `import { ${_ObjName}Repository } from '../../4-infrastructure/repositories/${_ObjName}Repository.js';
import { AppError } from "../../5-shared/errors/AppError.js"

export class ${_ObjName}QueryService {
    /** @type {${_ObjName}Repository} */
    #${_objName}Repository;

    /**
     * @param {${_ObjName}Repository} ${_objName}Repository 
     */
    constructor(${_objName}Repository) {
        this.#${_objName}Repository = ${_objName}Repository;
    }

    async getXXX(???) {
        const XXX = await this.#${_objName}Repository.findAll((???));
        if(!XXX)  throw new AppError('XXX不存在', 404);
        return XXX;
    }
}`, { flag: 'wx' });

fs.appendFileSync(path.resolve(__dirname,"src/2-application/services/index.js"), `
console.warn("TODO： 在服务层桶文件中注册新服务 //src/2-application/services/index.js");
/*
import { ${_ObjName}QueryService } from './${_ObjName}QueryService.js';
${_objName}Query: new ${_ObjName}QueryService(repositories.${_objName}Repository),
*/`);

} catch (err) {
  if (err.code === 'EEXIST') {
    console.log('文件已存在，跳过写入:', serviceFille);
  } else {
    console.error('写入发生其他错误:', serviceFille, err);
  }
}

//repository
const repoFile = path.resolve(d4, `${_ObjName}Repository.js`);
try {
  fs.writeFileSync(repoFile, `import { Op } from "sequelize";
export class ${_ObjName}Repository {
    #${_ObjName}Model;

    constructor(sequelize) {
        this.#${_ObjName}Model = sequelize.models.${_ObjName};//TODO：检查对象名与模型的实际区别
    }
}`, { flag: 'wx' });

fs.appendFileSync(path.resolve(__dirname,"src/4-infrastructure/repositories/index.js"), `
console.warn("TODO: 仓储桶文件注册仓储 // src/4-infrastructure/repositories/index.js")
    /*
import { ${_ObjName}Repository } from './${_ObjName}Repository.js';
${_objName}Repository: new ${_ObjName}Repository(sequelize),
    */`);
} catch (err) {
  if (err.code === 'EEXIST') {
    console.log('文件已存在，跳过写入:', repoFile);
  } else {
    console.error('写入发生其他错误:', repoFile, err);
  }
}