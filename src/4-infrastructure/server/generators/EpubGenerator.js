import path from "node:path";
import { randomBytes } from "node:crypto";
import Epub from 'epub-gen';//可替代版本 pnpm install @publiwrite/html-to-epub
import { BookExportData } from "../../../2-application/dto/BookExportData.dto.js"
import { IGenerator } from '../../../2-application/ports/IGenerator.js';
import { accessDir } from "../drivers/fileSystemDriver.js";

export class EpubGenerator extends IGenerator {
    constructor(temp) {
        super(temp);
    }

    /**
     * 生成文件
     * @param {BookExportData} ebook 
     * @param {string} outputPath 文件输出地址
     * @returns {{ path, filename }} 导出结果
     */
    async generate(ebook, outputPath) {
        const { setting } = ebook;
        const { embedTitle, isCompact, enableIndent } = setting;

        let option = {
            title: ebook.title, // *必需，书籍标题。
            author: ebook.author || "佚名", // *必需，作者名字。
            appendChapterTitles: embedTitle,//是否在章节内容前面添加章节标题
            lang: "zh-CN",
            css: enableIndent ? `\np,.rr{ text-indent: 2em;} \n` : "",//统一加入段落缩进
            tocTitle: "目  录",//默认 Table Of Contents
            publisher: setting.publisher,
            cover: ebook.cover, // URL 或文件路径，均可。
            content: [],
            tempDir: outputPath || this.tempFolder,
            verbose: false,//是否输出控制台日志
        }

        option.content = this.#setChapters(ebook, isCompact);
        const outputFile = `${ebook.title}${randomBytes(2).toString("hex")}.epub`;
        option.output = path.join(option.tempDir, outputFile);
        await accessDir(option.output);
        return new Epub(option).promise.then(
            () => { return { path: option.output, filename: outputFile }; },
            err => {
                err.stack = `ERROR: create Epub failed on: ${import.meta.filename}\n${err.stack}`
                throw err;
            }
        );
    }


    /**
     * 设置章节（含简介）
     * @param {*} ebook 
     * @param {boolean} isCompact 是否紧凑模式：紧凑模式——段落之间用换行代替段落符
     */
    #setChapters(ebook, isCompact) {
        const chapters = [];
        if (ebook.introduction)
            chapters.push({
                excludeFromToc: true,//不加入目录
                beforeToc: true,//先于目录之前显示: --不起作用
                title: "简介",
                data: `<p>${ebook.introduction.split("\n").join("</p>\n<p>")}</p>`
            });

        for (let chap of ebook.chapters) {
            const rows = chap.content?.split("\n") || [];
            let mark = "p";
            let splitor = "</p>\n<p>";
            if (!isCompact || chap.volume) {
                splitor = `</${mark}>\n<br/>\n<${mark} class="rr">`;
            }

            chapters.push({
                title: chap.title,
                data: `<${mark}>${rows?.join(splitor)}</${mark}>`
            });
        }
        return chapters;
    }

}