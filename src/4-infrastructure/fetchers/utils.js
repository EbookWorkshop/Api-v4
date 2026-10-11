import fs from "node:fs/promises";
import path from "node:path";



/**
 * 判断是否必须的结果都已获取 失败时仅做日志记录
 * @param {Array<string>} promise 
 * @param {Map<string,Array<{text}>>|null} result 
 * @param {*} config 
 * @param {string} url 
 * @param {string} urlAnser 
 * @param {string} pageContent 
 */
export async function promiseResult(promise, result, config, url, urlAnser, pageContent) {
    if (promise.length <= 0) return;

    let ok = true;
    for (const pName of promise) {
        if (!result || !result.has(pName) || !result.get(pName)?.[0].text) { ok = false; break; }
    }

    if (!ok) {
        const urlPath = path.parse(url);
        const hostname = new URL(url)?.hostname;
        let fileName = `${urlPath.name}_${Date.now()}${urlPath.ext || ".html"}`;
        let dir = path.join(config.repository.path, "temp", "html");
        await fs.mkdir(dir, { recursive: true });
        const logFile = path.join(dir, hostname, fileName);
        await fs.mkdir(path.join(dir, hostname), { recursive: true });
        await fs.writeFile(logFile, `<!-- 请求地址：${url} -->\n<!-- 响应地址：${urlAnser} -->\n${pageContent}`);
        return logFile;
    }
}