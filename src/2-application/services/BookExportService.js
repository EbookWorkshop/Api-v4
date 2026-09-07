
import { EXPORT_EVENTS } from "../constants/Event.js";
import { IFileWriter } from "../ports/IFileWriter.js"
import { BookExportData } from '../dto/BookExportData.dto.js';
import { BookQueryService } from "../services/BookQueryService.js"
import { ChapterQueryService } from "../services/ChapterQueryService.js"
import { GeneratorFactory } from "../../4-infrastructure/server/generators/GeneratorFactory.js"
import { EventManager } from "../../4-infrastructure/event/EventManager.js";
import { AppError } from "../../5-shared/errors/index.js";

/**
 * 图书导出服务
 */
export class BookExportService {
    /** @type {BookQueryService} */
    #bookQueryService;
    /** @type {VolumeQueryService} */
    #volumeQueryService;
    /** @type {ChapterQueryService} */
    #chapterQueryService;

    /** @type {IFileWriter} */
    #fileWriter;
    /** @type {CoverService} */
    #coverService;

    /** @type {GeneratorFactory} */
    #generatorFactory;
    /** @type {EventManager} */
    #eventManager;
    #config;
    /** @type {Array<string>} 收集制作过程中的警告信息 */
    #resultWarning;

    /**
     * @param {{book:BookQueryService,volume:VolumeQueryService,chapter:ChapterQueryService}} bookService 
     * @param {GeneratorFactory} generatorFactory 
     * @param {IFileWriter} fileWriter 
     * @param {EventManager} eventMgr 
     * @param {Object} config 
     */
    constructor(bookService, generatorFactory, fileWriter, coverService, eventMgr, config) {
        const { book, volume, chapter } = bookService;
        this.#bookQueryService = bookService.book;
        this.#volumeQueryService = bookService.volume;
        this.#chapterQueryService = bookService.chapter;

        if (!book || !volume || !chapter) throw new AppError("[BookExportService]初始化失败，基础服务缺失！");

        this.#generatorFactory = generatorFactory;
        this.#fileWriter = fileWriter;
        this.#coverService = coverService;
        this.#eventManager = eventMgr;
        this.#config = config;
        this.#resultWarning = new Array();
    }

    /**
     * 导出Epub
     * @param {*} setting 
     */
    async exportEpub(setting) { return await this.exportBook(setting.bookId, "epub", setting); }
    /**
     * 导出Txt
     * @param {*} setting 
     */
    async exportTxt(setting) { return await this.exportBook(setting.bookId, "txt", setting); }
    /**
     * 导出Epub
     * @param {*} setting 
     */
    async exportPdf(setting) { return await this.exportBook(setting.bookId, "pdf", setting); }


    /**
     * 导出书本
     * @param {number} bookId 
     * @param {epub|pdf|txt} format 文件格式
     * @param {object} setting 
     * @returns {{ path, filename,warning }} 导出结果
     */
    async exportBook(bookId, format, setting) {
        let result = null;
        let runErr = null;
        let bookName = "";
        try {
            const { volumeIds, chapterIds, embedBookName, coverImageData, ...rest } = setting;
            let showChapters = chapterIds || [];

            //获取章节——TODO: 应用字典校阅功能
            if (volumeIds && volumeIds.length > 0) {
                showChapters = await this.#chapterQueryService.listChaptersByVolumes(bookId, volumeIds);
            } else if (chapterIds && chapterIds.length > 0) {
                showChapters = await this.#chapterQueryService.listChaptersByIds(bookId, chapterIds);
            } else {
                showChapters = await this.#chapterQueryService.listChaptersByBook(bookId);
            }

            //获取所有卷信息
            const volumes = await this.#volumeQueryService.findByBookId(bookId);
            //获取书本基本信息
            const book = await this.#bookQueryService.getBook(bookId);
            //获取简介
            const introduction = await this.#chapterQueryService.getIntroduction(bookId);
            //设置出版商
            if (!rest.publisher) rest.publisher = `EBook Workshop v${this.#config.version}`;

            //设置排版
            const chapterAftTyp = this.#applyTypography(volumes, showChapters);

            let coverPath;
            if (format != "txt") {
                const cvRsl = await this.#coverService.prepareCoverForExport(book.CoverImg, embedBookName, coverImageData);
                coverPath = cvRsl.path;
                if (cvRsl.temp) this.#eventManager.emit(EXPORT_EVENTS.TEMP_CLEANUP, {
                    filePath: coverPath,
                    delay: 600_000 // 10分钟后清理
                })
            }
            bookName = book.BookName;
            const exportData = new BookExportData({
                title: book.BookName,
                author: book.Author,
                cover: coverPath,
                introduction: introduction?.Content,
                chapters: chapterAftTyp,
                setting: rest,           //格式、排版、字体等设置
            });

            // 通过工厂接口，运行时获取对应的生成器实例
            const generator = this.#generatorFactory.create(format);

            // // 执行生成
            result = await generator.generate(exportData);
            result.warnings = this.#resultWarning.concat(result.warnings);
            return result;
        } catch (error) {
            error.stack = `BookExportService::exportBook: ${import.meta.filename}\n${error.stack}`;
            runErr = error;
            throw error;
        } finally {
            delete setting.coverImageData;//可能存在大段文本（几MB的封面）
            this.#eventManager.emit(EXPORT_EVENTS.FILE_GENERATED, { payload: { bookId, bookName, format, setting, result, error: runErr } });
        }
    }

    /**
     * 应用排版
     * @param {Array<{Title,Content}>} chapters 
     * @returns {Array<{title,content}>}
     * @param {*} setting 
     */
    #applyTypography(volumes, chapters) {
        let resultChapt = chapters.map(({ Title: title, Content: content, VolumeId }) => ({ title, content, VolumeId }));

        for (let chap of resultChapt) {
            if (!chap.content) {
                chap.content = title + "\n\n-= 章节内容缺失 =-";
                this.#resultWarning.push(`【缺失正文】：\t${title}`);
            }
            let rows = chap.content?.split("\n");//正文按行分割

            //设置压缩——去除空行
            rows = rows.filter(s => s.length > 0);

            //去掉行首空白
            for (let i = 0; i < rows.length; i++) rows[i] = rows[i].trim();

            chap.content = rows.join("\n");
        }

        //按卷重组
        if (volumes?.length > 0) {
            const newChapterArray = [];

            for (let v of volumes) {
                const chapOnVol = resultChapt.filter(chap => chap.VolumeId === v.VolumeId);
                if (chapOnVol.length === 0) continue;

                newChapterArray.push({
                    title: v.Title,
                    content: v.Introduction || "",
                    volume: true,//标记为卷
                });
                newChapterArray.push(...chapOnVol);
            }
            resultChapt = newChapterArray;
        }

        return resultChapt;
    }
}