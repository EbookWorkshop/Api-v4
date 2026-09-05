import swaggerJsdoc from 'swagger-jsdoc';
import { generateAsyncAPISpec } from 'asyncapi-jsdoc';
import fs from 'node:fs';
import path from 'node:path';
import { fileURLToPath } from 'node:url';

const __dirname = path.dirname(fileURLToPath(import.meta.url));

async function genAsyncApi() {
    const spec = await generateAsyncAPISpec({
        definition: {
            asyncapi: '3.1.0',
            info: {
                title: 'EBook Workshop API',
                version: '4.0.0',
                description: 'EBook Workshop 的 Socket 接口。',
            },
            servers: {
                public: {
                    host: `localhost:8300`,
                    protocol: "ws"
                }
            },
        },
        apis: [
            './src/1-interfaces/websocket/handlers/**/*.js',
        ],
    });

    const savePath = path.resolve(__dirname, '../docs/asyncapi.json');
    fs.writeFileSync(savePath, JSON.stringify(spec, null, 2));
    console.log('✅ AsyncApi 文档已生成到:', savePath);
}


async function genSwagger() {
    const options = {
        definition: {
            openapi: '3.0.0',
            info: {
                title: 'V4 Book API',
                version: '4.0.0',
                description: '分层架构示例 API',
            },
            servers: [{ url: 'http://localhost:8300' }],
        },
        apis: [path.resolve(__dirname, '../src/1-interfaces/http/**/*.js')],
    };

    const specs = swaggerJsdoc(options);
    const savePath = path.resolve(__dirname, '../docs/swagger.json');
    fs.writeFileSync(savePath, JSON.stringify(specs, null, 2));
    console.log('✅ Swagger 文档已生成到:', savePath);
}


await genSwagger();
await genAsyncApi();