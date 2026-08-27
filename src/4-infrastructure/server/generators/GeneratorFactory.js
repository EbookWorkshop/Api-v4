// src/4-infrastructure/server/generators/GeneratorFactory.js
import path from "node:path"
import { IGeneratorFactory } from '../../../2-application/ports/IGeneratorFactory.js';
import { UserInputError } from '../../../5-shared/errors/index.js';
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
        const temp = path.join(this.#tempFolder, format);
        switch (format) {
            case 'epub':
                return new EpubGenerator(temp);
            case 'pdf':
                return new PdfGenerator(temp);
            case 'txt':
                return new TxtGenerator(temp);
            default:
                throw new UserInputError(`不支持的导出格式: ${format}`);
        }
    }
}