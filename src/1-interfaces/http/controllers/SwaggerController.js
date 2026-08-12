
export class SwaggerController {
  #config;


  constructor(config) {
    this.CDN = "https://cdn.jsdelivr.net/npm";
    this.#config = config;
  }

  async getJSONFile(ctx) {
    //TDOD：如果要自动生成json，需要将服务分派到swagger-jsdoc
    ctx.state.skipResponseWrapper = true;
    // ctx.body = await fsPromises.readFile(path.resolve(process.cwd(), "docs", "swagger.json"));

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
      ]
    };

    const options = {
      swaggerDefinition,
      apis: ['./src/1-interfaces/http/**/*.js'],     // micromatch 规则
    };
    ctx.body = jsdoc(options)
  }

  getScalar(ctx) {
    const myCDN = ctx.query.cdn ? decodeURIComponent(ctx.query.cdn) : this.CDN;
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

  getStoplight(ctx) {
    const myCDN = ctx.query.cdn ? decodeURIComponent(ctx.query.cdn) : this.CDN;
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

  getUIDist(ctx) {
    const myCDN = ctx.query.cdn ? decodeURIComponent(ctx.query.cdn) : this.CDN;
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
}
