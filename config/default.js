// 默认配置（所有环境继承）
export default {
  repository‌: {
    path: "../MyLibrary"
  },
  font: {
    path: "/font"
  },
  server: {
    port: 8300,
    host: '0.0.0.0',
  },
  database: {
    path: './data/dev.sqlite',
    logging: false,
  },
  debug: {
    mode: false,
    level: 'info',
    switch: {
      requireLog: false,
    }
  },
  collector: {
    timeout: 30000,
    retries: 3,
  },
  version: "0.0.0",   //当前程序版本
};
