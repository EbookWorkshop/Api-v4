// 生产环境配置
export default {
  server: {
    port: 8080,
  },
  database: {
    path: '/var/lib/data/prod.sqlite',
    logging: false,
  },
  debug: {
    mode: false,
  },
};
