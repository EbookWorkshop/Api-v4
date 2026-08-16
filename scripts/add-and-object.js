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

export class ${_ObjName}Controller {
    #${_objName}QueryService;

    /**
     * @param {${_ObjName}QueryService} ${_objName}QueryService 
     */
    constructor(${_objName}QueryService) {
        this.#${_objName}QueryService = ${_objName}QueryService;
    }
    //TODO: 加入控制器，加入注解
/*
TODO: 需要手工加入控制器 // src/1-interfaces/http/controllers/index.js
import { ${_ObjName}Controller } from "./${_ObjName}Controller.js"
${_objName}: new ${_ObjName}Controller(services.${_objName}Query),//参考
*/
}`
const c1p = path.resolve(d1c, `${_ObjName}Controller.js`);
try {
  fs.writeFileSync(c1p, fController, { flag: 'wx' });
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
  fs.writeFileSync(routeFile, `import Router from '@koa/router';

export function create${_objName}Routes(${_objName}Controller) {
    const router = new Router({ prefix: '/${_objName}' });//TODO: 需要修改
    router.get('/all', (ctx) => {});// TODO：添加实际路由

    return router;
}`, { flag: 'wx' });
} catch (err) {
  if (err.code === 'EEXIST') {
    console.log('文件已存在，跳过写入:', routeFile);
  } else {
    console.error('写入发生其他错误:', routeFile, err);
  }
}

//service
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
}`, { flag: 'wx' });
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

    //TODO: 加入到主库中 // src/4-infrastructure/repositories/index.js
    /*
import { ${_ObjName}Repository } from './${_ObjName}Repository.js';
${_objName}Repository: new ${_ObjName}Repository(sequelize),
    */
}`, { flag: 'wx' });
} catch (err) {
  if (err.code === 'EEXIST') {
    console.log('文件已存在，跳过写入:', repoFile);
  } else {
    console.error('写入发生其他错误:', repoFile, err);
  }
}