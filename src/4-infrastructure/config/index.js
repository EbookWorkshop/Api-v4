import { ConfigLoader } from './ConfigLoader.js';

let configInstance = null;

export async function loadConfig(env = process.env.NODE_ENV) {
  if (!configInstance) {
    const loader = new ConfigLoader(env);
    configInstance = await loader.load();
  }
  return configInstance;
}
