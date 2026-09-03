import axios from 'axios';
import puppeteer from 'puppeteer'
// import Iconv from 'iconv-lite';
import { IDataFetcher } from '../../2-application/ports/IDataFetcher.js';
import { RuleEngine } from './engines/RuleEngine.js';

export class AxiosDataFetcher extends IDataFetcher {
    #config;
    /** @type {RuleEngine} */
    #ruleEngine;
    constructor(config, ruleEngine) {
        super();
        this.#config = config;
        this.#ruleEngine = ruleEngine;
    }

    async fetch(url, options) {
        const response = await axios.get(url, {
            timeout: options.timeout,
            headers: { 'User-Agent': options.userAgent }
        });

        return await this.#parseHtmlString(response.data, url, options);
    }

    /**
     * 解释字符串，获取配置的规则提取内容
     * 以Dom方式提取
     * @param {*} htmlString 
     * @param {*} setting 
     * @returns result<Map>
     */
    async #parseHtmlString(htmlString, url, setting) {
        const browser = await puppeteer.launch({ headless: "new" });
        const page = await browser.newPage();

        // 将传入的 HTML 字符串设置为页面内容
        //    'about:blank' 是目标URL，核心是 setContent 方法
        await page.setContent(htmlString, {
            waitUntil: 'networkidle0' // 等待网络和脚本加载完成
        });

        const { rules, dictionaries } = setting;
        let result = await this.#ruleEngine.extract(page, rules, dictionaries || []);
        await browser.close();

        return result;
    }



    /**
     * 通过 URL 获取的 Buffer
     * @param {string} url - 的完整 URL
     * @param {object} options - 请求的额外配置（如 headers、代理等）
     * @returns {Promise<Buffer>} 返回数据的 Buffer
     */
    async download(url, setting = {}) {
        try {
            const options = {};
            if (setting.userAgent) options.headers = { 'User-Agent': setting.userAgent };
            if (setting.timeout) options.timeout = setting.timeout;
            const response = await axios({
                method: 'GET',
                url: url,
                // NOTE: 将响应类型设置为 'arraybuffer'，确保返回的是二进制数据
                responseType: 'arraybuffer',
                // 合并传入的自定义配置，如 headers
                ...options,
            });

            // 检查 HTTP 状态码是否成功 (2xx)
            if (response.status >= 200 && response.status < 300) {
                // response.data 在 responseType 为 'arraybuffer' 时是一个 ArrayBuffer
                // 将其转换为 Node.js 的 Buffer 并返回
                return Buffer.from(response.data);
            } else {
                throw new Error(`HTTP 请求失败，状态码: ${response.status}`);
            }
        } catch (error) {
            // 增强错误信息，方便调试
            if (error.response) {
                // 服务器响应了，但状态码不在 2xx 范围内
                throw new Error(`下载图片失败: ${error.response.status} ${error.response.statusText}`);
            } else if (error.request) {
                // 请求已发出，但没有收到响应
                throw new Error(`下载图片失败: 无响应 (${error.message})`);
            } else {
                // 请求配置出错
                throw new Error(`下载图片失败: ${error.message}`);
            }
        }
    }
}