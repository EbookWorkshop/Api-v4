// src/2-application/ports/IGeneratorFactory.js
import { IGenerator } from './IGenerator.js';

/**
 * 生成器工厂接口（端口）
 * 职责：根据格式字符串，返回对应的 IGenerator 实例
 */
export class IGeneratorFactory {
    /**
     * @param {string} format - 'epub' | 'pdf' | 'txt'
     * @returns {IGenerator}
     */
    create(format) {
        throw new Error('Method not implemented');
    }
}