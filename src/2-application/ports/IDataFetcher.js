export class IDataFetcher {
    /**
     * 采集数据
     * @param {string} url
     * @param {Object} options - { timeout, userAgent, scraping, rules }
     * @returns {Promise<Map<string, Array<{text, url}>>>}
     */
    async fetch(url, options) { throw new Error('尚未实现～！'); }
}