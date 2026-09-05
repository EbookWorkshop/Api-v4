import { randomBytes } from "node:crypto";
import { RuleName } from "../../../3-domain/constants/Rule.js"
import { ICollector } from "../../ports/ICollector.js";
import { COLLECT_EVENTS } from "../../../3-domain/constants/Event.js";

export class FileCollector extends ICollector {
    #config;
    #rules;//全套规则
    #fetcher;
    #eventManager;
    /** @type {IFileWriter} */
    #fileWriter;

    constructor(config, rules, fetcher, services) {
        super();
        this.#rules = rules;
        this.#fetcher = fetcher;
        this.#eventManager = services.eventManager;
        this.#fileWriter = services.fileWriter;
        this.#config = config;
    }

    /**
     * 
     * @param {*} setting 
     * @param {*} payload 
     * @returns 
     */
    async fetch(setting, payload) {

        const pageCtx = [];//结果组，一页一个元素
        let urlPage = payload.url;
        let runTime = 0;
        let result = [];
        do {
            result = await this.#fetcher.fetch(urlPage, setting);
            const ctx = result.get(RuleName.Content);
            if (!ctx || !ctx[0].text) { runTime++; console.debug(`内容采集失败，重试${runTime}次：`, urlPage); continue; }
            const { text: content } = ctx[0];
            pageCtx.push(content);

            const pg = result.get(RuleName.ContentNextPage);
            if (Error.isError(pg[0])) { runTime++; console.debug(`内容采集失败，重试${runTime}次：`, urlPage); continue; }
            const { Rule: rule, text, url } = pg[0];
            if (text === rule.checkSetting) urlPage = url;
            else break;
        } while (urlPage && runTime <= 15);//最大重试次数
        const cont = pageCtx.some(t => !t);
        if (runTime >= 15 || cont) return this.#resultHandle({ ...payload, pageCtx }, false, "抓取的文章存在缺页。");


        //写入到硬盘
        let fileName = `未定义文件名_${randomBytes(3).toString("hex")}.txt`;
        let cn = result.get(RuleName.CapterTitle);
        if (cn && cn[0]?.text) fileName = `${cn[0]?.text}.txt`;
        const filePath = await this.#fileWriter.saveFile([this.#config.archive.path, fileName], pageCtx);

        return this.#resultHandle({ ...payload, filePath, fileName }, true, `文件已存储到${filePath}`);
    }

    #resultHandle(payload, result, message) {
        const { url } = payload;
        this.#eventManager.emitToMain(COLLECT_EVENTS.UPDATE_CHAPTER, { url, result, message });
        return { ...payload, result, message };
    }
}

