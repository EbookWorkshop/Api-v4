import { BookExportData } from "../../../2-application/dtos/BookExportData.dto.js"
import { IGenerator } from '../../../2-application/ports/IGenerator.js';
import Epub from 'epub-gen';
import fs from 'node:fs/promises';
import path from 'node:path';

export class EpubGenerator extends IGenerator {
    #config;
    constructor(config) {
        this.#config = config;
    }

    /**
     * 生成文件
     * @param {BookExportData} ebook 
     * @param {string} outputPath 文件输出地址
     */
    async generate(ebook, outputPath) {
        const { embedTitle } = ebook.setting;

        let option = {
            title: ebook.title, // *必需，书籍标题。
            author: ebook.author || "佚名", // *必需，作者名字。
            appendChapterTitles: embedTitle,//是否在章节内容前面添加章节标题
            lang: "zh-CN",
            css: "",
            tocTitle: "目  录",//默认 Table Of Contents
            publisher: `EBook Workshop v${version}`, // 可选
            // cover: "https://www.alice-in-wonderland.net/wp-content/uploads/1book1.jpg", // URL 或文件路径，均可。
            content: [],
            tempDir: outputPath,
        }

    }


}