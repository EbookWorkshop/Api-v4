import path from 'node:path';
import fs from 'node:fs';
import { fileURLToPath } from 'node:url';

const __dirname = path.dirname(fileURLToPath(import.meta.url));

const DEFAULT_CONFIG = {
  server: { port: 3000, host: '0.0.0.0' },
  database: { path: './data/dev.sqlite', logging: false },
  debug: { mode: false, level: 'info' },
  collector: { timeout: 30000, retries: 3 },
};

export class ConfigLoader {
  constructor(env = process.env.NODE_ENV || 'development') {
    this.env = env;
    this.configDir = path.resolve(__dirname, '../../../config');
  }

  async load() {
    let finalConfig = { ...DEFAULT_CONFIG };

    // 合并 default.js
    const defaultFile = path.join(this.configDir, 'default.js');
    if (fs.existsSync(defaultFile)) {
      const mod = await import(`${defaultFile}?t=${Date.now()}`);
      finalConfig = this.#deepMerge(finalConfig, mod.default || mod);
    }

    // 合并 {env}.js
    const envFile = path.join(this.configDir, `${this.env}.js`);
    if (fs.existsSync(envFile)) {
      const mod = await import(`${envFile}?t=${Date.now()}`);
      finalConfig = this.#deepMerge(finalConfig, mod.default || mod);
    }

    // 合并 local.js (本地覆盖)
    const localFile = path.join(this.configDir, 'local.js');
    if (fs.existsSync(localFile)) {
      const mod = await import(`${localFile}?t=${Date.now()}`);
      finalConfig = this.#deepMerge(finalConfig, mod.default || mod);
    }

    // 环境变量覆盖
    finalConfig = this.#applyEnvOverrides(finalConfig);

    return Object.freeze(finalConfig);
  }

  #applyEnvOverrides(config) {
    const c = { ...config };
    if (process.env.PORT) c.server.port = parseInt(process.env.PORT, 10);
    if (process.env.DB_PATH) c.database.path = process.env.DB_PATH;
    if (process.env.DEBUG_MODE === 'true') c.debug.mode = true;
    if (process.env.COLLECTOR_TIMEOUT) c.collector.timeout = parseInt(process.env.COLLECTOR_TIMEOUT, 10);
    return c;
  }

  #deepMerge(target, source) {
    const result = { ...target };
    for (const key in source) {
      if (source[key] && typeof source[key] === 'object' && !Array.isArray(source[key])) {
        result[key] = this.#deepMerge(result[key] || {}, source[key]);
      } else {
        result[key] = source[key];
      }
    }
    return result;
  }
}
