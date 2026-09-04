import puppeteer from 'puppeteer';
import { IDataFetcher } from "../../2-application/ports/IDataFetcher.js"
import { RuleEngine } from './engines/RuleEngine.js';

export class PuppeteerDataFetcher extends IDataFetcher {
    #config;
    /** @type {RuleEngine} */
    #ruleEngine;

    #browser;
    /** 是否保持资源（一直打开浏览器模式）注意： 保持模式下需要手动关闭！ */
    #keep;
    constructor(config, ruleEngine, isKeep = false) {
        super();
        this.#config = config;
        this.#ruleEngine = ruleEngine;

        this.#browser = null;
        this.#keep = isKeep;
    }

    /**
     * 采集数据
     * @param {string} url
     * @param {Object} setting - { timeout, userAgent, scraping, rules }
     * @returns {Promise<Map<string, Array<{text, url}>>>}
     */
    async fetch(url, setting) {
        const startTime = performance.now();
        let browser = await this.#getBrowser(setting);

        let result = new Map();

        try {
            let page = await browser.newPage();

            // {
            //     // DEBUG: 接管console 网站在浏览器上发的空调信息转发到服务器控台
            //     page.on("console", msg => { console.log(`[浏览器]:${msg.text()}`) });
            // }

            if (setting.userAgent) await page.setUserAgent({ userAgent: setting.userAgent });//设置用户代理

            // 配置需要访问网址
            await page.goto(url, { timeout: setting.timeout, waitUntil: 'networkidle2' });

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
            // await fs.writeFile(`/temp/html/${randomBytes(6).toString("hex")}.html`, await page.content());
            if (this.#keep) await page.close();
        } catch (err) {
            console.warn("[执行失败]PuppeteerDataFetcher::fetch", err.message, `\t耗时：${(performance.now() - startTime) / 1000}秒`, url);
            throw err;
        } finally {
            if (!this.#keep && browser) await browser.close(); //确保关掉以免因失败耗费内存
        }

        return result;        // 结束关闭
    }


    /**
     * 使用 Puppeteer 通过 URL 获取的 Buffer
     * @param {string} url - 的完整 URL
     * @param {object} options - 额外配置（可选）
     * @param {object} options.viewport - 视口大小，默认 { width: 800, height: 600 }
     * @param {string} options.userAgent - 自定义 User-Agent
     * @param {number} options.timeout - 页面加载超时（毫秒），默认 30000
     * @param {boolean} options.headless - 是否无头模式，默认 true
     * @returns {Promise<Buffer>} 数据的 Buffer
     */
    async download(url, options = {}) {
        let browser = null;
        try {
            browser = await this.#getBrowser(options);

            const page = await browser.newPage();

            // 设置视口            await page.setViewport(options.viewport || { width: 800, height: 600 });

            // 设置 User-Agent（如果提供）
            if (options.userAgent) {
                await page.setUserAgent({ userAgent: options.userAgent });
            } else {
                // 或者设置为一个典型的 Chrome 版本
                await page.setUserAgent({ userAgent: 'Mozilla/5.0 (Windows NT 10.0; Win64; x64) AppleWebKit/537.36 (KHTML, like Gecko) Chrome/120.0.0.0 Safari/537.36' });
            }

            // 访问 URL，获取响应
            const response = await page.goto(url, {
                timeout: options.timeout || 30000,
                waitUntil: 'load', // 等待加载完成
            });

            if (!response) throw new Error('未收到响应');

            // 检查 HTTP 状态码 //不检查状态码，
            // if (!response.ok()) {
            //     throw new Error(`HTTP 请求失败，状态码: ${response.status()}`);
            // }

            // 获取资源二进制数据 Buffer
            return await response.buffer();
        } catch (error) {
            throw new Error(`Puppeteer::download 下载资源 Buffer 失败: ${error.message}`);
        } finally {
            if (!this.#keep && browser) await browser.close();
        }
    }

    async #getBrowser(setting) {
        let options = {
            //设置视窗的宽高
            defaultViewport: {
                width: 1400,
                height: 900
            },
            headless: "new",    //默认值new：新无头模式，https://developer.chrome.com/articles/new-headless/
            slowMo: 233,        //设置放慢每个步骤的毫秒数
            ignoreDefaultArgs: ['--enable-automation', '--no-sandbox', '--disable-setuid-sandbox'],      //去掉自动化提示-可能对部分反爬策略有帮助
            timeout: setting.timeout
        }

        if (!this.#browser) this.#browser = await puppeteer.launch(options);
        return this.#browser;
    }

    async close() {
        if (this.#browser) {
            await this.#browser.close();
            this.#browser = null;
            // console.debug("浏览器已关闭。");
        }
    }
}