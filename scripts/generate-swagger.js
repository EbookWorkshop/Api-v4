import swaggerJsdoc from 'swagger-jsdoc';
import fs from 'node:fs';
import path from 'node:path';
import { fileURLToPath } from 'node:url';

const __dirname = path.dirname(fileURLToPath(import.meta.url));

const options = {
  definition: {
    openapi: '3.0.0',
    info: {
      title: 'V2 Book Collector API',
      version: '0.1.0',
      description: '分层架构示例 API',
    },
    servers: [{ url: 'http://localhost:3000' }],
  },
  apis: [path.resolve(__dirname, '../src/1_interfaces/http/**/*.js')],
};

const specs = swaggerJsdoc(options);
fs.writeFileSync(path.resolve(__dirname, '../docs/swagger.json'), JSON.stringify(specs, null, 2));
console.log('✅ Swagger 文档已生成到 docs/swagger.json');
