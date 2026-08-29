import os from "node:os";
import path from "node:path";
import https from "node:https";
import fs from "node:fs/promises";
import { exec } from 'node:child_process';
// import { exec } from 'node:child_process/promises';  //当前版本ESM加载器不支持promises子路径。以后升级node可以尝试。
// import { promisify } from 'node:util';   
import { VERSION_FILE } from "../../3-domain/constants/System.js";
import { toMB_Unit, toGBStr } from "../../5-shared/utils/fileSize.js"


//NOTE: 因为npm outdated会以失败退出码反馈是否有升级，node的promisify不能用，手搓一个从stdout读取内容。
const promisify = (fun) => {
    return (cmd) => {
        return new Promise((resolve, reject) => {
            fun(cmd, (error, stdout, stderr) => {
                if (stdout) resolve(stdout);
                else reject(error, stderr);
            });
        });
    };
}
const execAsync = promisify(exec);

export class ServiceServer {
    #config;

    constructor(config) {
        this.#config = config;
    }

    async version() {
        let pVer = [];
        try {
            const verStr = await fs.readFile(VERSION_FILE);
            pVer = JSON.parse(verStr);
        } catch (err) {
            this.updateVersionInfo();
        }
        const dbStat = await fs.stat(this.#config.database.path);
        return {
            version: this.#config.version,
            dataPath: path.resolve(this.#config.repository.path),
            databaseSize: dbStat.size,
            appMem: toMB_Unit(process.memoryUsage().rss),
            nodeVersion: process.version, //Node.js版本
            runTime: performance.now(),
            osType: os.type(),
            osRelease: os.release(),//系统内核
            cpu: os.cpus().map(({ model, speed }) => ({ model, speed })),
            memFree: toGBStr(os.freemem()),
            memTotal: toGBStr(os.totalmem()),
            packageVersion: pVer,
        }
    }

    /**
     * 更新版本信息
     */
    async updateVersionInfo() {
        try {
            const runOption = {
                env: {
                    ...process.env,          // 保留其他环境变量
                    NODE_OPTIONS: undefined   // 移除node的启动参数 如：--inspect
                },
            }
            const result = await Promise.all([
                execAsync("pnpm outdated --json", runOption),        //NOTE: 这个命令在有包可更新时，会以1作为退出码（process.exit(1)）在系统底层会认为命令出错从而触发reject。但stdout输出是正常的，直接采用即可。
                execAsync("pnpm list --json --depth=0", runOption)
            ]);
            const [outdata, packageList] = result.map((j) => JSON.parse(j));
            const packageInfo = Object.assign({}, packageList[0].dependencies);//NOTE: pnpm返回的是数组，npm返回的是对象，修改命令要注意调整取数方式
            for (let pack of Object.keys(outdata)) packageInfo[pack] = Object.assign(packageInfo[pack], outdata[pack]);

            await fs.writeFile(VERSION_FILE, JSON.stringify(packageInfo));
        }
        catch (error) {
            if (this.#config.env === "development") console.warn("执行更新包版本信息出错，错误信息：", error);
        }
    }

    /**
     * 检查网站是否可达
     * @param {*} hostname 
     * @returns 
     */
    async checkSiteAccessibility(hostname) {
        return new Promise((resolve, reject) => {
            hostname = hostname.replace(/https?:\/\//, ''); // 去掉http://或https://
            // 发送HTTPs请求
            https.get({ hostname, timeout: 5000 }, (response) => {
                let html = "";
                let resTitle = "";
                const resUrl = response.headers.location || response.client._host;
                response.on('data', (chunk) => {
                    html += chunk;
                });
                response.on("end", () => {
                    const title = html.match(/<title>([^<]+)<\/title>/);
                    if (title?.length >= 2) resTitle = title[1];

                    resolve({
                        status: response.statusCode,
                        result: false,
                        location: resUrl,
                        title: resTitle,
                    });
                });

            }).on('error', (err) => {
                // 如果请求失败，返回false
                resolve({
                    status: -500,
                    result: false,
                    error: err
                });
            }).on('timeout', () => {
                // 如果请求超时，返回false
                resolve({
                    status: -555,
                    title: "Time Out",
                    result: false
                });
            });
        });
    }
}
