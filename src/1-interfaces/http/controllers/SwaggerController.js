import { AppError } from "../../../5-shared/errors/AppError.js";

export class SwaggerController {
  #config;
  /**
   * 可选的CDN
   * https://unpkg.com/:package@:version/:file    //缺省version为latest
   * https://cdn.jsdelivr.net/npm/:package@:version/:file    //缺省version为latest
   */
  #cdns;

  /**
   * 
   * @param {*} config 
   */
  constructor(config) {
    this.#config = config;
    this.#cdns = ["https://unpkg.com", "https://cdn.jsdelivr.net/npm"]
  }

  async getJSONFile(ctx) {
    //TDOD：如果要自动生成json，需要将服务分派到swagger-jsdoc
    ctx.state.skipResponseWrapper = true;
    const isSafeHttpCode = ctx.query.safehttp == "1";//兼容部分不支持600的合同谈判编码的文档工具

    const { default: jsdoc } = await import("swagger-jsdoc");
    const { version, server: { port } } = this.#config;
    const swaggerDefinition = {
      openapi: "3.0.0",
      info: {
        title: 'EBook Workshop API',
        version: version.split('.').slice(0, 2).join('.'),
        description: 'EBook Workshop 的接口。统一约定：如果返回的结果是json格式的接口，<br/>`{"code":20000}`用于代表成功，`{"code":50000}`代表服务器执行失败，`{"code":60000}`代表用户引起的失败（如输入错误类型等）。',
      },
      servers: [
        {
          "url": `http://localhost:${port}`
        }
      ],
      tags: [  // 排序控制
        { name: 'Library —— 图书馆' },
        { name: 'Library - WebBook —— 网文图书馆' },
        { name: 'Library - Tag —— 图书馆管理' },
        { name: 'Library - Bookmark —— 图书馆书签' },
      ],
      'x-tagGroups': [
        {
          name: '新系统架构',
          tags: ['Book', 'Tag'],
        },
        {
          name: '原风格排版',
          tags: ['Library —— 图书馆', 'Library - Tag —— 图书馆管理'],
        },
      ],
    };

    const options = {
      swaggerDefinition,
      apis: [
        './src/1-interfaces/http/controllers/**/*.js',
        './src/1-interfaces/http/dtos/**/*.dto.js',
      ],     // micromatch 规则
    };
    let jsonDoc = jsdoc(options);

    ctx.body = isSafeHttpCode ? JSON.stringify(jsonDoc).replaceAll(`"600"`, `"default"`) : jsonDoc;
  }

  async getScalar(ctx) {
    const myCDN = ctx.query.cdn ? decodeURIComponent(ctx.query.cdn) : (await findFastestCDN(this.#cdns)).url;
    ctx.set('Content-Type', 'text/html');
    ctx.state.skipResponseWrapper = true;
    ctx.body = `
<!doctype html>
<html>
  <head>
    <title>Scalar API Reference</title>
    <meta charset="utf-8" />
    <meta name="viewport" content="width=device-width, initial-scale=1" />
  </head>
  <body>
    <script id="api-reference" data-url="/swagger.json"></script>
    <script src="${myCDN}/@scalar/api-reference@latest/dist/browser/standalone.js">/*${myCDN}/@scalar/api-reference*/</script>
  </body>
</html>`;
  }

  async getStoplight(ctx) {
    const myCDN = ctx.query.cdn ? decodeURIComponent(ctx.query.cdn) : (await findFastestCDN(this.#cdns)).url;
    ctx.set('Content-Type', 'text/html');
    ctx.state.skipResponseWrapper = true;
    ctx.body = `
<!doctype html>
<html lang="en">
  <head>
    <meta charset="utf-8">
    <meta name="viewport" content="width=device-width, initial-scale=1, shrink-to-fit=no">
    <title>Elements in HTML</title>
    <!-- Embed elements Elements via Web Component -->
    <script src="${myCDN}/@stoplight/elements/web-components.min.js"></script>
    <link rel="stylesheet" href="${myCDN}/@stoplight/elements/styles.min.css">
  </head>
  <body>
    <elements-api
      apiDescriptionUrl="/swagger.json"
      router="hash"
      layout="sidebar"
    />
  </body>
</html>`;
  }

  async getUIDist(ctx) {
    const myCDN = ctx.query.cdn ? decodeURIComponent(ctx.query.cdn) : (await findFastestCDN(this.#cdns)).url;
    ctx.set('Content-Type', 'text/html');
    ctx.state.skipResponseWrapper = true;
    ctx.body = `
<!doctype html>
<html lang="en">
  <head>
    <meta charset="utf-8">
    <meta name="viewport" content="width=device-width, initial-scale=1, shrink-to-fit=no">
    <title>Swagger UI Dist</title>
  </head>
  <body>
<div id="openapi-ui-container" spec-url="/swagger.json" theme="light"></div>
<script src="${myCDN}/openapi-ui-dist@latest/lib/openapi-ui.umd.js"></script>
  </body>
</html>`;
  }

  async getSwaggerUI(ctx) {
    const myCDN = ctx.query.cdn ? decodeURIComponent(ctx.query.cdn) : (await findFastestCDN(this.#cdns)).url;
    ctx.set('Content-Type', 'text/html');
    ctx.state.skipResponseWrapper = true;
    ctx.body = `<!DOCTYPE html>
<html lang="zh-cn">
  <head>
    <meta charset="utf-8" />
    <meta name="viewport" content="width=device-width, initial-scale=1" />
    <meta name="description" content="SwaggerUI" />
    <title>SwaggerUI</title>
    <link rel="stylesheet" href="${myCDN}/swagger-ui-dist/swagger-ui.css" />
  </head>
  <body>
  <div id="swagger-ui"></div>
  <script src="${myCDN}/swagger-ui-dist/swagger-ui-bundle.js" crossorigin></script>
  <script src="${myCDN}/swagger-ui-dist/swagger-ui-standalone-preset.js" crossorigin></script>
  <script>
    window.onload = () => {
      window.ui = SwaggerUIBundle({
        url: '/swagger.json',
        dom_id: '#swagger-ui',
        presets: [
          SwaggerUIBundle.presets.apis,
          SwaggerUIStandalonePreset
        ],
        layout: "StandaloneLayout",
      });
    };
  </script>
  </body>
</html>`;
  }

  async getRapiDoc(ctx) {
    const myCDN = ctx.query.cdn ? decodeURIComponent(ctx.query.cdn) : (await findFastestCDN(this.#cdns)).url;
    ctx.set('Content-Type', 'text/html');
    ctx.state.skipResponseWrapper = true;
    ctx.body = `<!doctype html>
<html>
  <head>
    <meta charset="utf-8">
    <meta name="viewport" content="width=device-width, minimum-scale=1, initial-scale=1, user-scalable=yes">
    <script src="${myCDN}/rapidoc/dist/rapidoc-min.min.js"></script>
  </head>
  <body>
    <rapi-doc spec-url="/swagger.json" > </rapi-doc>
  </body>
</html>`;
  }

  async getReDoc(ctx) {
    //ReDoc 不支持非标准的Http代码，如600，会导致文档解释报错。
    const myCDN = ctx.query.cdn ? decodeURIComponent(ctx.query.cdn) : (await findFastestCDN(this.#cdns)).url;
    ctx.set('Content-Type', 'text/html');
    ctx.state.skipResponseWrapper = true;
    ctx.body = `<!DOCTYPE html>
<html>
  <head>
    <title>ReDoc</title>
    <meta charset="utf-8"/>
    <meta name="viewport" content="width=device-width, initial-scale=1">
    <style>
      body { margin: 0; padding: 0; }
    </style>
  </head>
  <body>
    <redoc spec-url='/swagger.json?safehttp=1'></redoc>
    <script src="${myCDN}/redoc/bundles/redoc.standalone.js"> </script>
  </body>
</html>`;
  }
}

/**
 * 找到最快的CDN
 * @param {*} urls 
 * @returns 
 */
function findFastestCDN(urls) {
  return Promise.any(urls.map(url =>
    new Promise((resolve, reject) => {
      const start = performance.now();
      fetch(url, { method: 'HEAD', mode: 'no-cors' }) // 或加载图片
        .then(() => resolve({ url, latency: performance.now() - start }))
        .catch(() => reject());
      // 设置超时（如 3秒）
      setTimeout(() => reject(), 30_000);
    })
  )).catch(err => { throw new AppError("暂无可用CND，请稍候重试。已尝试CDN：" + urls.toString(), 500) });
}