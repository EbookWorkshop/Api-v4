// 默认配置（所有环境继承）
export default {
    repository: { path: "../MyLibrary" },//其它配置的path，可以用 @ 表示相对 repository 的路径
    archive: { path: "@/Books" },
    cover: { path: "@/Cover" },
    font: { path: "@/font" },
    tempDir: { path: "@/temp" },
    server: {
        port: 8300,
        host: '0.0.0.0',
    },
    database: {
        path: '@/Data/latest.sqlite',
        logging: false,
    },
    debug: {
        mode: false,
        level: 'info',      // level 表示"最详细的级别"，>= 该值的日志都会被打印 none:0>error:1>warn:2>info:3>log:4>debug:5。
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
