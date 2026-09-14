import { IGenerator } from '../../../2-application/ports/IGenerator.js';
import path from 'node:path';
import { randomBytes } from "node:crypto";
import pdfmake from "pdfmake";
import { accessDir } from "../drivers/fileSystemDriver.js"

const FONTNAME = "MyFont";
const A4_WIDTH = 595.28;
const A4_HEIGHT = 841.89;
const FONT_SIZE = 12;

export class PdfGenerator extends IGenerator {
    constructor(temp) {
        super(temp);
    }

    async generate(ebook, outputPath) {
        const { embedTitle, enableIndent } = ebook.setting;
        const result = { path: "", filename: "", warnings: [], result: "ok" };
        outputPath = outputPath || this.tempFolder;
        result.filename = `${ebook.title}${randomBytes(2).toString("hex")}.pdf`;
        result.path = path.join(outputPath, result.filename);
        await accessDir(path.dirname(result.path));

        if (ebook.setting.font) {
            const fontPath = ebook.setting.font.path;
            pdfmake.addFonts({
                [FONTNAME]: {
                    normal: fontPath,
                    bold: fontPath,
                    italics: fontPath,
                    bolditalics: fontPath,
                }
            });
        }

        const content = [];

        // ========== 1. 封面：满页居中 ==========
        if (ebook.cover) {
            content.push({
                image: ebook.cover,
                // 铺满整页；absolutePosition 相对页面左上角，忽略页边距
                width: A4_WIDTH,
                height: A4_HEIGHT,
                absolutePosition: { x: 0, y: 0 },
            });
            // 封面之后强制分页，否则后面的内容会和封面重叠
            content.push({ text: '', pageBreak: 'after' });
        }

        // ========== 2. 简介 ==========
        if (ebook.introduction) {
            content.push({ text: "简介", style: 'header' });
            content.push({ text: ebook.introduction, leadingIndent: FONT_SIZE * 2 });
        }

        // ========== 3. 目录：单独新起一页 ==========
        content.push({ text: '', pageBreak: 'before' });
        content.push({
            toc: {
                id: 'mainToc',
                title: { text: '꧁༺ 目 · 录 ༻꧂', style: 'header' },
            },
        });

        // ========== 4. 每一章 ==========
        for (const chap of ebook.chapters) {
            // 章节标题节点 —— 无论是否 embedTitle，都带 tocItem，所以都会进目录
            const titleNode = {
                text: chap.title,
                tocItem: ['mainToc'],
                pageBreak: 'before',   // 每章新起一页
            };

            if (embedTitle) {
                // 显示标题：用 header 样式
                Object.assign(titleNode, {
                    style: 'header',
                });
            } else {
                // 隐藏标题：白色 + 极小的字号，视觉上看不见，但目录里正常显示
                Object.assign(titleNode, {
                    color: 'white',
                    fontSize: 0.1,
                    margin: [0, 0, 0, 0],
                });
            }
            content.push(titleNode);

            // 章节正文
            let lines = chap.content.split("\n");
            // if (enableIndent) lines = lines.map(t => "_   " + t);
            for (const line of lines) {
                content.push({ text: line, leadingIndent: FONT_SIZE * 2 * (enableIndent ? 1 : 0) });
            }
        }

        const docDefinition = {
            content,
            pageSize: 'A4',
            pageMargins: [40, 60, 40, 60],
            defaultStyle: { font: FONTNAME, fontSize: FONT_SIZE, lineHeight: 1.5 },
            styles: {
                header: { fontSize: 18, bold: true, alignment: 'center', margin: [0, 0, 0, 12] },
            },
        };

        const pdf = pdfmake.createPdf(docDefinition);
        await pdf.write(result.path);
        // console.log("success");
        return result;
    }
}