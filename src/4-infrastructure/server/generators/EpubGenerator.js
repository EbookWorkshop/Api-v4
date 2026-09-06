import path from "node:path";
import { randomBytes } from "node:crypto";
import { EPub } from '@publiwrite/html-to-epub';
import { BookExportData } from "../../../2-application/dto/BookExportData.dto.js"
import { IGenerator } from '../../../2-application/ports/IGenerator.js';

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
        try {
            let option = {
                title: ebook.title, // *必需，书籍标题。
                description: ebook.introduction,
                author: ebook.author || "佚名", // *必需，作者名字。
                appendChapterTitles: embedTitle,//是否在章节内容前面添加章节标题
                lang: "zh",
                // font:[],//自定义字体的绝对路径数组，这些字体将被包含在电子书中，以便在自定义 CSS 中使用。例如，若配置为 fonts: ['/path/to/Merriweather.ttf']，则可在自定义 CSS 中这样引用：src : url("./fonts/Merriweather.ttf")
                css: enableIndent ? `\np,.rr{ text-indent: 2em;} \n` : "",//统一加入段落缩进
                tocTitle: "目  录",//默认 Table Of Contents
                publisher: setting.publisher,
                cover: ebook.cover, // URL 或文件路径，均可。
                content: [],
                tempDir: outputPath || this.tempFolder,
                verbose: false,//是否输出控制台日志

                //PubliWrite 新增配置
                assetFailureMode: "throw",       //内联文件报错时如何处理 throw:抛出、warn:输出带有损坏引用的清单`{warnings}`
                allowFileUrls:true,              //默认 false。拒绝 file:// URL
            }
            // await accessDir(option.tempDir); //EPub底层有这个代码

            option.content = this.#setChapters(ebook, isCompact);
            const outputFile = `${ebook.title}${randomBytes(2).toString("hex")}.epub`;
            const output = path.join(option.tempDir, outputFile);
            let epub = new EPub(option, output);
            const result = await epub.render();
            return { path: output, filename: outputFile, ...result };
        } catch (error) {
            error.stack = `ERROR: create Epub failed on: ${import.meta.filename}\n${error.stack}`
            throw error;
        }
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
                //图片路径应为绝对路径（以 http 或 https 开头），以便下载。升级后也支持本地图片（路径必须以 file:// 开头）。
                data: `<${mark}>${rows?.join(splitor)}</${mark}>`
            });
        }
        return chapters;
    }

}