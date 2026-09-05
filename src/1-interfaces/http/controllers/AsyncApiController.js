
import { AppError, UserInputError } from '../../../5-shared/errors/index.js';
import { findFastestCDN } from "../../../5-shared/utils/site.js"

export class AsyncApiController {
    #config;
    #cdns;
    /**
     * @param {config} config 
     */
    constructor(config) {
        this.#config = config;
        this.#cdns = ["https://unpkg.com", "https://cdn.jsdelivr.net/npm"]
    }

    async getDoc(ctx) {
        const { generateAsyncAPISpec } = await import('asyncapi-jsdoc');
        const { version, server: { port } } = this.#config;

        // 调用函数生成 AsyncAPI 规范
        const spec = await generateAsyncAPISpec({
            definition: {
                asyncapi: '3.1.0',
                info: {
                    title: 'EBook Workshop API',
                    version: version.split('.').slice(0, 2).join('.'),
                    description: 'EBook Workshop 的 Socket 接口。',
                },
                servers: {
                    public: {
                        // url: `ws://localhost:${port}`,
                        host: `localhost:${port}`,
                        protocol: "ws"
                    }
                },
            },
            apis: [
                './src/1-interfaces/websocket/handlers/**/*.js',
            ],
        });

        // 返回 JSON 格式的文档
        ctx.state.skipResponseWrapper = true;
        ctx.body = spec;
    }

    async getScalar(ctx) {
        const myCDN = ctx.query.cdn ? decodeURIComponent(ctx.query.cdn) : (await findFastestCDN(this.#cdns)).url;
        const darkMode = ctx.query?.theme === "dark" ? "darkMode: true," : "";
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
    <div id="app"></div>
    <script src="${myCDN}/@scalar/api-reference@latest/dist/browser/standalone.js">/*${myCDN}/@scalar/api-reference*/</script>
    <script>
      Scalar.createApiReference('#app', {
        url: '/asyncapi.json',
        ${darkMode}
        //theme:'moon',//alternate,default,moon,purple,solarized,bluePlanet,saturn,kepler,mars,deepSpace,laserwave
        hideModels: true,
        hideDarkModeToggle: true,
      })
    </script>
  </body>
</html>`;
    }

    async getStudio(ctx) {
        const { version, server: { port } } = this.#config;
        const studioUrl = `https://studio.asyncapi.com/?url=http://localhost:${port}/asyncapi.json`
        ctx.redirect(studioUrl);
    }
}

/**
 * 找到最快的CDN
 * @param {*} urls 
 * @returns 
 */
function findFastestCDN(urls) {
    return Promise.any(urls.map(url => {
        const start = performance.now();
        return fetch(`${url}/the-best-package/index.js?t=${start}`, {
            method: 'HEAD',
            signal: AbortSignal.timeout(30_000)
        }).then(res => {
            if (!res.ok) throw new Error('Bad status');
            return { url, latency: performance.now() - start };
        })
    })).catch(error => {
        return { url: urls[0] }
    });
}