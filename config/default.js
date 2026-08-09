// 默认配置（所有环境继承）
export default {
  server: {
    port: 3000,
    host: '0.0.0.0',
  },
  database: {
    path: './data/dev.sqlite',
    logging: false,
  },
  debug: {
    mode: false,
    level: 'info',
  },
  collector: {
    timeout: 30000,
    retries: 3,
  },
};
