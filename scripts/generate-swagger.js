import swaggerJsdoc from 'swagger-jsdoc';
import fs from 'node:fs';
import path from 'node:path';
import { fileURLToPath } from 'node:url';

const __dirname = path.dirname(fileURLToPath(import.meta.url));

const options = {
    definition: {
        openapi: '3.0.0',
        info: {
            title: 'V4 Book API',
            version: '4.0.0',
            description: '分层架构示例 API',
        },
        servers: [{ url: 'http://localhost:3000' }],
    },
    apis: [path.resolve(__dirname, '../src/1-interfaces/http/**/*.js')],
};

const specs = swaggerJsdoc(options);
const savePath = path.resolve(__dirname, '../docs/swagger.json');
fs.writeFileSync(savePath, JSON.stringify(specs, null, 2));
console.log('✅ Swagger 文档已生成到:', savePath);
