// src/2-application/services/BookExportService.js
import { BookDetailQueryService } from "./BookDetailQueryService.js"
import { GeneratorFactory } from "../../4-infrastructure/server/generators/GeneratorFactory.js"
import { BookExportData } from '../dtos/BookExportData.dto.js';

export class BookExportService {
    #bookDetailQueryService;
    #generatorFactory; // 依赖的是工厂接口，而不是具体实现

    /**
     * @param {BookDetailQueryService} bookDetailQueryService 
     * @param {GeneratorFactory} generatorFactory 
     */
    constructor(bookDetailQueryService, generatorFactory) {
        this.#bookDetailQueryService = bookDetailQueryService;
        this.#generatorFactory = generatorFactory;
    }

    /**
     * 到处书本
     * @param {number} bookId 
     * @param {epub|pdf|txt} format 文件格式
     */
    async exportBook(bookId, format) {
        const book = await this.#bookDetailQueryService.getBookDetail(bookId);
        const exportData = new BookExportData({
            title: book.BookName,
            author: book.Author,
            cover: book.CoverImg,
            introduction: book.Introduction,
            volumes: book.Volumes,
            chapters: book.Index.map(ch => ({ title: ch.Title, content: ch.Content })),
            setting: {}          //TODO：格式、排版、字体等设置
        });

        // 通过工厂接口，运行时获取对应的生成器实例
        const generator = this.#generatorFactory.create(format);

        // // 执行生成
        const outputPath = `./exports/${bookId}.${format}`;//TODO：设置输出地址
        return await generator.generate(exportData, outputPath);
    }
}