import axios from 'axios';
import puppeteer from 'puppeteer'
// import Iconv from 'iconv-lite';
import { IDataFetcher } from '../../2-application/ports/IDataFetcher.js';
import { RuleEngine } from './engines/RuleEngine.js';

export class HttpDataFetcher extends IDataFetcher {
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
}