// src/4-infrastructure/server/generators/GeneratorFactory.js
import path from "node:path";
import { IGeneratorFactory } from '../../../2-application/ports/IGeneratorFactory.js';
import { AppError } from '../../../5-shared/errors/AppError.js';
import { EpubGenerator } from './EpubGenerator.js';
import { PdfGenerator } from './PdfGenerator.js';
import { TxtGenerator } from './TxtGenerator.js';

export class GeneratorFactory extends IGeneratorFactory {
    #tempFolder;

    /**
     * 配置
     * @param {string} tempFolder 临时文件目录
     */
    constructor(tempFolder) {
        super();
        this.#tempFolder = tempFolder;
    }

    /**
     * 创建生成器
     * @param {epub|pdf|txt} format 生成器文件格式 - 'epub' | 'pdf' | 'txt'
     * @returns 
     */
    create(format) {
        switch (format) {
            case 'epub':
                return new EpubGenerator(this.#tempFolder);
            case 'pdf':
                return new PdfGenerator(this.#tempFolder);
            case 'txt':
                return new TxtGenerator(this.#tempFolder);
            default:
                throw new AppError(`不支持的导出格式: ${format}`, 400);
        }
    }
}