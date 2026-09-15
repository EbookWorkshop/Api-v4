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

        // 检查允许的本地文件路径，返回 true 表示允许读取
        pdfmake.setLocalAccessPolicy((path) => {
            // return path.startsWith("fonts/") || path.startsWith("/usr/share/fonts/");
            return true;
        });

        // 检查允许的域名，返回 true 表示允许访问
        pdfmake.setUrlAccessPolicy((url) => {
            // return url.startsWith("https://example.com/") || url.startsWith("https://your-cdn.com/");
            return false;
        });
    }

    async generate(ebook, outputPath) {
        const fontSize = ebook.setting.fontSize ?? FONT_SIZE;
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

        //扉页标题
        let titleFontSize = 64;
        if (ebook.title.length > 16) titleFontSize /= 3;
        else if (ebook.title.length > 8) titleFontSize /= 2;
        content.push({
            text: ebook.title,
            fontSize: titleFontSize, alignment: 'center',
            absolutePosition: { y: A4_HEIGHT / 2 - titleFontSize / 2 },
        });
        content.push({ text: ebook.author, alignment: 'center', pageBreak: 'after', absolutePosition: { y: A4_HEIGHT / 2 + titleFontSize * 2 } });

        // ========== 2. 简介 ==========
        if (ebook.introduction) {
            content.push({ text: "简介", style: 'header' });
            content.push({ text: ebook.introduction, leadingIndent: fontSize * 2 });
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
            for (const line of lines) {
                content.push({ text: line, leadingIndent: fontSize * 2 * (enableIndent ? 1 : 0) });
            }
        }

        const docDefinition = this.#handlerDefinition(fontSize, ebook.setting.publisher);
        docDefinition.content = content;
        const pdf = pdfmake.createPdf(docDefinition);
        await pdf.write(result.path);
        return result;
    }

    /**
     * 
     * @param {*} file 
     * @param {*} setting 
     * @returns {Promise<import("node:stream").Stream>}
     */
    createSteam(file, setting) {
        const pdf = this.#createPdf(file, setting);
        return pdf.getStream();
    }

    /**
     * 生成 PDF 的 Buffer
     * @returns {Promise<Buffer>}
     */
    createBuffer(file, setting) {
        const pdf = this.#createPdf(file, setting);
        return pdf.getBuffer();   // pdfmake 返回 Promise<Buffer>
    }

    /**
     * 通用PDF生成
     * @param {*} file 
     * @param {object} setting 
     * @param {object} setting.font 如果要显示汉字，字体设置则必填
     * @param {object} setting.font.path 字体的路径
     * @param {number} [setting.fontSize] 
     * @param {string} [setting.publisher] 
     */
    #createPdf(file, setting) {
        const fontSize = setting.fontSize ?? FONT_SIZE;
        if (setting.font) {
            const fontPath = setting.font.path;
            pdfmake.addFonts({
                [FONTNAME]: {
                    normal: fontPath,
                    bold: fontPath,
                    italics: fontPath,
                    bolditalics: fontPath,
                }
            });
        }
        let files = Array.isArray(file) ? file : [file];
        const content = [];

        for (let i = 0; i < files.length; i++) {
            const file = files[i];
            const titleNode = {
                text: file.title,
                style: 'header',
                // pageBreak: 'before',   // 每章新起一页
            };
            content.push(titleNode);
            let lines = file.content.split("\n");
            for (const line of lines) {
                content.push({ text: line, leadingIndent: fontSize * 2 });
            }
            if (i + 1 < files.length) content.push({ text: "", alignment: 'center', pageBreak: 'after', style: 'header', });
        }

        const docDefinition = this.#handlerDefinition(fontSize, setting.publisher);
        docDefinition.content = content;

        const pdf = pdfmake.createPdf(docDefinition);
        return pdf;
    }

    /**
     * 通用文档格式设置
     * @param {*} fontSize 字体大小
     * @param {*} footerStr 页脚文本
     * @returns 
     */
    #handlerDefinition(fontSize, footerStr) {
        const topAndbottomSpan = 30;
        const definition = {
            content: [{}],
            pageSize: 'A4',
            pageMargins: [40, topAndbottomSpan, 40, topAndbottomSpan], // [左, 上, 右, 下]
            defaultStyle: { font: FONTNAME, fontSize: fontSize, lineHeight: 1 },
            styles: {
                header: { fontSize: Math.round(fontSize * 1.5), bold: true, alignment: 'center', margin: [0, 0, 0, 12] },
            },
        }
        if (footerStr) definition.footer = function (currentPage, pageCount) {
            return {
                text: footerStr,
                fontSize: 8,
                color: '#888888',
                italics: true,
                alignment: 'center', // 居中显示
                margin: [40, 0, 40, topAndbottomSpan / 3]
            }
        }

        return definition;
    }
}