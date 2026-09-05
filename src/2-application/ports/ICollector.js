import { IDataFetcher } from "../ports/IDataFetcher.js";
import { AppError } from "../../5-shared/errors/index.js";
export class ICollector {
    /**
     * 
     * @param {*} config 
     * @param {Array<Object>} rules 
     * @param {IDataFetcher} fetcher 抓取服务
     * @param {object} services 注入的服务
     */
    constructor(config, rules, fetcher, services) { }

    /**
     * 进行采集
     * @param {*} setting 数据设置
     */
    fetch(setting, payload) { throw new AppError("ICollector::fetch 接口尚未实现") }
}