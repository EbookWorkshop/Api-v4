import { IDataFetcher } from "../ports/IDataFetcher.js";
import { AppError } from "../../5-shared/errors/index.js";
export class ICollector {
    /**
     * 
     * @param {Array<Object>} rules 
     * @param {IDataFetcher} fetcher 
     */
    constructor(rules, fetcher) { }

    /**
     * 进行采集
     * @param {*} setting 数据设置
     */
    fetch(setting) { throw new AppError("ICollector::fetch 接口尚未实现") }
}