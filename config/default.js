// 默认配置（所有环境继承）
export default {
    repository: {
        path: "../MyLibrary"
    },
    archive: { path: "/Books" },
    font: {
        path: "/font"
    },
    tempDir: {
        path: "/temp"
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
        level: 'info',      //TODO: 优化-分层化消息层级 error:1>warn:2>info:3>debug:4>none:5  当config.debug.level<="当前消息等级"时，才打印消息。
        switch: {
            requireLog: false,
            worker: true,
        }
    },
    collector: {
        timeout: 30000,
        retries: 3,
    },
    version: "0.0.0",   //当前程序版本——最终会被package.json上的配置覆盖
};
