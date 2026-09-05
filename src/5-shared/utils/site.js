import { URL } from "node:url";


/**
 * 根据网址返回对应的站点
 * @param {string} urlString 需要分析的网址
 * @returns 返回纯粹的域名如 www.abc.com
 */
export function getHost(urlString) {
    try {
        if (!/^https?:\/\//i.test(urlString)) {
            urlString = 'http://' + urlString;
        }
        let urlObj = new URL(urlString);
        let host = urlObj.host;
        return host;
    } catch (err) {
        // console.error(err);
    }
}

/**
 * NOTE: 注意：是从网址推断扩展名
 * @param {string} urlString 网址
 */
export function eXtname(urlString, def = "") {
    return urlString?.match(/(?<=\.)[^.]+$/)?.[0] || def;
}

/**
 * 找到最快的CDN
 * @param {*} urls 
 * @returns 
 */
function findFastestCDN(urls) {
    return Promise.any(urls.map(url => {
        const start = performance.now();
        return fetch(`${url}/the-best-package/index.js?t=${start}`, {
            method: 'HEAD',
            signal: AbortSignal.timeout(30_000)
        }).then(res => {
            if (!res.ok) throw new Error('Bad status');
            return { url, latency: performance.now() - start };
        })
    })).catch(error => {
        return { url: urls[0] }
    });
}