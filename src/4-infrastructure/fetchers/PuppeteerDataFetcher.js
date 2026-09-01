import puppeteer from 'puppeteer';
import { IDataFetcher } from "../../2-application/ports/IDataFetcher.js"
import { RuleEngine } from './engines/RuleEngine.js';

export class PuppeteerDataFetcher extends IDataFetcher {
    #config;
    /** @type {RuleEngine} */
    #ruleEngine;
    constructor(config, ruleEngine) {
        super();
        this.#config = config;
        this.#ruleEngine = ruleEngine;
    }

    /**
     * 采集数据
     * @param {string} url
     * @param {Object} setting - { timeout, userAgent, scraping, rules }
     * @returns {Promise<Map<string, Array<{text, url}>>>}
     */
    async fetch(url, setting) {
        const startTime = performance.now();
        let options = {
            //设置视窗的宽高
            defaultViewport: {
                width: 1400,
                height: 900
            },
            headless: "new",    //默认值new：新无头模式，https://developer.chrome.com/articles/new-headless/
            slowMo: 233,        //设置放慢每个步骤的毫秒数
            ignoreDefaultArgs: ['--enable-automation'],      //去掉自动化提示-可能对部分反爬策略有帮助
            timeout: setting.timeout
        }

        let browser = await puppeteer.launch(options);
        let result = new Map();

        try {
            let page = await browser.newPage();

            if (setting.userAgent) await page.setUserAgent({ userAgent: setting.userAgent });//设置用户代理

            // 配置需要访问网址
            await page.goto(url, { timeout: setting.timeout, waitUntil: 'networkidle2' });
            //await page.exposeFunction('ActionHandle',DoAction); //在页面注册全局函数

            //数据分析采集
            const { rules, dictionaries } = setting;
            result = await this.#ruleEngine.extract(page, rules, dictionaries || []);
            if (url != page.url()) {
                result.set("URL", {
                    expect: url,
                    actual: page.url(),
                    message: "请求地址与实际地址不一致，发生过重定向。",
                });
            }

        } catch (err) {
            console.warn("[执行失败]PuppeteerDataFetcher::fetch", err.message, `\t耗时：${(performance.now() - startTime) / 1000}秒`, url);
            throw err;
        } finally {
            if (browser) await browser.close(); //确保关掉以免因失败耗费内存
        }

        return result;        // 结束关闭
    }
}