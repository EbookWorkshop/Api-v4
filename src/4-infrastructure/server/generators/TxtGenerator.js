import path from "node:path";
import { createWriteStream } from 'node:fs';
import { finished } from 'node:stream/promises';
import { randomBytes } from "node:crypto";

import { accessDir, writeOnStream } from "../drivers/fileSystemDriver.js"
import { IGenerator } from '../../../2-application/ports/IGenerator.js';
import { BookExportData } from "../../../2-application/dto/BookExportData.dto.js"


export class TxtGenerator extends IGenerator {
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
        let writeStream = null;
        try {
            let { embedTitle, enableIndent } = ebook.setting;
            outputPath = outputPath || this.tempFolder;
            const outputFile = `${ebook.title}${randomBytes(2).toString("hex")}.txt`;
            outputPath = path.join(outputPath, outputFile);

            await accessDir(path.dirname(outputPath));
            writeStream = createWriteStream(outputPath);
            await writeOnStream(writeStream, `${ebook.title}\n`);
            if (ebook.author) await writeOnStream(writeStream, `作者：${ebook.author}\n`);
            if (ebook.publisher) await writeOnStream(writeStream, `${ebook.publisher}\n`);
            if (ebook.introduction) await writeOnStream(writeStream, `\n简介：\n${ebook.introduction}\n\n`);

            for (let chap of ebook.chapters) {
                if (chap.volume) await writeOnStream(writeStream, `\n꧁༺ ${chap.title} ༻꧂\n`);
                else if (embedTitle) await writeOnStream(writeStream, `\n✦ ${chap.title}\n`);
                let content = chap.content;
                if (enableIndent) {
                    let multiLine = content.split("\n");
                    multiLine = multiLine.map(t => `\t${t.trimStart()}`);    //去除行首空格
                    content = multiLine.join("\n");
                }
                await writeOnStream(writeStream, `${content}\n`)
            }

            writeStream.end()
            await finished(writeStream);//写入流Promise化，等待写入完成

            return { path: outputPath, filename: outputFile };
        } catch (error) {
            if (writeStream) writeStream.destroy();
            throw error;
        }
    }
}