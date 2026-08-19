// src/2-application/services/FontService.js
import { SYSTEM_DEFAULT_FONT } from '../../3-domain/constants/SystemConfigGroup.js';
import { IFileScanner } from '../ports/IFileScanner.js';

import path from "node:path";

export class FontService {
  #systemConfigService;
  #fontDirPath;          // 字体目录的绝对路径
  #staticUrlPrefix;      // 静态资源 URL 前缀（如 '/static'）
  #fileScanner;

  /**
   * 
   * @param {*} systemConfigService 
   * @param {*} fontDirPath 字体目录与资源目录的相对路径
   * @param {*} staticUrlPrefix 
   * @param {IFileScanner} fileScanner 
   */
  constructor(systemConfigService, fontDirPath, staticUrlPrefix = '/font', fileScanner) {
    this.#systemConfigService = systemConfigService;
    this.#fontDirPath = fontDirPath;
    this.#staticUrlPrefix = staticUrlPrefix;
    this.#fileScanner = fileScanner;
  }

  /**
   * 获取当前系统使用的 UI 字体
   * @returns {Promise<{ name: string, url: string } | null>}
   */
  async getUIFont() {
    // 1. 从配置中读取字体名
    const fontName = await this.#systemConfigService.getConfig(SYSTEM_DEFAULT_FONT, 'defaultUIFont');

    if (!fontName) {
      // 如果未配置，可以返回默认字体或 null
      return null;
    }

    // 2. 在字体目录中查找匹配的文件（带扩展名）
    const matchedFile = await this.#fileScanner.findFileByBasename(this.#fontDirPath, fontName);
    if (!matchedFile) {
      // 如果文件不存在，可以记录警告并返回 null
      console.warn(`Font file not found for: ${fontName}`);
      return null;
    }

    // 3. 构建 URL
    const url = `${this.#staticUrlPrefix}/${matchedFile}`;

    return {
      name: fontName,
      url: url,
    };
  }

  /**
   * 列出字体目录下所有字体文件
   */
  async getFontList() {
    const fontFileType = ["ttf", "fon", "otf", "woff", "woff2", "ttc", "dfont"];
    const fontList = await this.#fileScanner.listFiles(this.#fontDirPath, { filetype: fontFileType, detail: true });
    if (!fontList) return [];
    return fontList.map(({ name, size, ...fon }) => ({
      url: path.join(this.#staticUrlPrefix, fon.file),
      size,
      name
    }));
  }

  /**
   * 获得阅读字体
   * @returns 字体名（文件名）
   */
  async getFontReading() {
    const fontName = await this.#systemConfigService.getConfig(SYSTEM_DEFAULT_FONT, 'defaultReadingFont');
    return fontName;
  }
}