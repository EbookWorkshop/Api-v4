export class IDataFetcher {
    /**
     * 采集数据
     * @param {string} url
     * @param {Object} options - { timeout, userAgent, scraping, rules }
     * @returns {Promise<Map<string, Array<{text, url}>>>}
     */
    async fetch(url, options) { throw new Error('尚未实现～！'); }

    /**
    * 使用 Puppeteer 通过 URL 获取的 Buffer
    * @param {string} url - 的完整 URL
    * @param {object} [options] - 额外配置（可选）
    * @param {object} [options.viewport] - 视口大小，默认 { width: 800, height: 600 }
    * @param {string} [options.userAgent] - 自定义 User-Agent
    * @param {number} [options.timeout] - 页面加载超时（毫秒），默认 30000
    * @param {boolean} [options.headless] - 是否无头模式，默认 true
    * @returns {Promise<Buffer>} 数据的 Buffer
    */
    async download(url, options) { throw new Error('IDataFetcher::download 尚未实现～！'); }

    /**
     * 如果需要允许手工管理下载器，那么就需要实现关闭接口，并自行关闭内部下载器
     */
    async close() { }
}