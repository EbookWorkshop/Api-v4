import fsPromises from "node:fs/promises";
import path from "node:path"
export class SwaggerController {


  constructor() {
    this.CDN = "https://cdn.jsdelivr.net/npm";
  }

  async getJSONFile(ctx) {
    //TDOD：如果要自动生成json，需要将服务分派到swagger-jsdoc
    ctx.state.skipResponseWrapper = true;
    ctx.body = await fsPromises.readFile(path.resolve(process.cwd(), "docs", "swagger.json"));
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
