// src/4-infrastructure/server/generators/GeneratorFactory.js
import { IGeneratorFactory } from '../../../2-application/ports/IGeneratorFactory.js';
import { AppError } from '../../../5-shared/errors/AppError.js';
import { EpubGenerator } from './EpubGenerator.js';
import { PdfGenerator } from './PdfGenerator.js';
import { TxtGenerator } from './TxtGenerator.js';

export class GeneratorFactory extends IGeneratorFactory {
    #config;
    constructor(config) {
        super();
        this.#config = config;
    }

    /**
     * 创建生成器
     * @param {epub|pdf|txt} format 生成器文件格式 - 'epub' | 'pdf' | 'txt'
     * @returns 
     */
    create(format) {
        const tempDir = this.#config?.tempDir?.path;
        switch (format) {
            case 'epub':
                return new EpubGenerator(tempDir);
            case 'pdf':
                return new PdfGenerator(tempDir);
            case 'txt':
                return new TxtGenerator(tempDir);
            default:
                throw new AppError(`不支持的导出格式: ${format}`, 400);
        }
    }
}