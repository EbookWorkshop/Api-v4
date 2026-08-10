// src/2-application/services/FontService.js
import { SYSTEM_DEFAULT_FONT } from '../../3-domain/constants/SystemConfigGroup.js';
import { findFileByBasename } from '../../4-infrastructure/server/fileSystemUtils.js';

export class FontService {
  #systemConfigService;
  #fontDirPath;          // 字体目录的绝对路径
  #staticUrlPrefix;      // 静态资源 URL 前缀（如 '/static'）

  constructor(systemConfigService, fontDirPath, staticUrlPrefix = '/font') {
    this.#systemConfigService = systemConfigService;
    this.#fontDirPath = fontDirPath;
    this.#staticUrlPrefix = staticUrlPrefix;
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
    const matchedFile = await findFileByBasename(this.#fontDirPath, fontName);
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
}