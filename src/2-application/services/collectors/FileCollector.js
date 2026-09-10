import { randomBytes } from "node:crypto";
import { RuleName } from "../../../3-domain/constants/Rule.js"
import { ICollector } from "../../ports/ICollector.js";
import { COLLECT_EVENTS } from "../../constants/Event.js";

export class FileCollector extends ICollector {
    #config;
    #rules;//全套规则
    #fetcher;
    /** @type {IFileWriter} */
    #fileWriter;
    #emitter;

    constructor(config, rules, fetcher, services) {
        super();
        this.#rules = rules;
        this.#fetcher = fetcher;
        this.#emitter = services.emitter;
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

    #resultHandle(payload, ok, message) {
        const { url, filePath, fileName } = payload;

        if (ok) {
            this.#emitter.success(COLLECT_EVENTS.FETCH_CHAPTER, {
                ctx: { url },
                data: { filePath, fileName },          // 成功时携带产出物信息
                message,
            });
        } else {
            this.#emitter.failure(COLLECT_EVENTS.FETCH_CHAPTER, {
                ctx: { url },
                error: { message },
                message,
            });
        }

        return { ...payload, result: ok, message };
    }
}

