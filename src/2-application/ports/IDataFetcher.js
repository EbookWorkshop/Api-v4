export class IDataFetcher {
    /**
     * 采集数据
     * @param {string} url
     * @param {Object} options - { timeout, userAgent, scraping, rules }
     * @returns {Promise<Map<string, Array<{text, url}>>>}
     */
    async fetch(url, options) { throw new Error('尚未实现～！'); }

    /**
     * 通过 URL 获取的 Buffer
     * @param {string} url - 的完整 URL
     * @param {object} options - 请求的额外配置（如 headers、代理等）
     * @returns {Promise<Buffer>} 返回数据的 Buffer
     */
    async download(url, options) { throw new Error('IDataFetcher::download 尚未实现～！'); }

    /**
     * 如果需要允许手工管理下载器，那么就需要实现关闭接口，并自行关闭内部下载器
     */
    async close() { }
}