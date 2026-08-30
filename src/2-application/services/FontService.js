// src/2-application/services/FontService.js
import path from 'node:path';
import { SYSTEM_DEFAULT_FONT } from '../../3-domain/constants/SystemConfigGroup.js';
import { AppError, UserInputError } from '../../5-shared/errors/index.js';

export class FontService {
    #systemConfigService;
    #fileScanner;
    #fileWriter;
    #fontDir;          // 字体目录相对于仓库根目录的相对路径，如 'font'
    #staticUrlPrefix;  // 例如 '/font'

    /**
     * @param {SystemConfigService} systemConfigService
     * @param {IFileScanner} fileScanner
     * @param {IFileWriter} fileWriter
     * @param {string} fontDir - 字体目录相对路径（如 'font'）
     * @param {string} staticUrlPrefix - 静态资源前缀（如 '/font'）
     */
    constructor(systemConfigService, fileScanner, fileWriter, fontDir, staticUrlPrefix = '/font') {
        this.#systemConfigService = systemConfigService;
        this.#fileScanner = fileScanner;
        this.#fileWriter = fileWriter;
        this.#fontDir = fontDir;
        this.#staticUrlPrefix = staticUrlPrefix;
    }

    // ---------- 查询 ----------
    async getFontList() {
        const fontFileTypes = ['ttf', 'fon', 'otf', 'woff', 'woff2', 'ttc', 'dfont'];
        const list = await this.#fileScanner.listFiles(this.#fontDir, {
            filetype: fontFileTypes,
            detail: true,
        });
        if (!list) return [];
        return list.map((item) => ({
            name: item.name,
            file: item.file,
            url: path.join(this.#staticUrlPrefix, item.file),
            size: item.size,
            createTime: item.createTime,
        }));
    }

    async getReadingFont() {
        const rF = await this.#systemConfigService.getConfig(SYSTEM_DEFAULT_FONT, 'defaultReadingFont');
        return rF || "楷体";
    }

    async getUIFont() {
        const fontName = await this.#systemConfigService.getConfig(SYSTEM_DEFAULT_FONT, 'defaultUIFont');
        if (!fontName) return { name: "宋体" };
        // 找到实际文件路径
        const matched = await this.#fileScanner.findFileByBasename(this.#fontDir, fontName);
        if (!matched) {
            // 文件丢失，返回名称但 URL 为空
            return { name: fontName, url: null };
        }
        return {
            name: fontName,
            url: path.join(this.#staticUrlPrefix, matched),
        };
    }

    // ---------- 命令 ----------
    async uploadFont(file) {
        if (!file) throw new UserInputError('未提供字体文件');
        const fileName = file.originalFilename || file.name;
        if (!fileName) throw new UserInputError('文件名无效');
        const savePath = path.join(this.#fontDir, fileName);
        await this.#fileWriter.saveFile(savePath, file.filepath, 'file'); // fileWriter 需支持从临时路径复制
        return { fileName, path: savePath };
    }

    async deleteFont(fontName) {
        if (!fontName || fontName === 'undefined') throw new UserInputError('字体名不能为空');
        const fullPath = path.join(this.#fontDir, fontName);

        // 检查是否存在
        if (! await this.#fileScanner.accessFile(fullPath)) throw new AppError(`字体文件 ${fontName} 不存在`, 404);
        // 删除文件
        await this.#fileWriter.deleteFile(fullPath);
        return true;
    }

    async renameFont(oldName, newName) {
        if (!oldName || !newName) throw new UserInputError('原文件名和新文件名都不能为空');
        const ext = path.extname(oldName);
        const newFull = newName + ext; // 保留原扩展名
        const oldPath = path.join(this.#fontDir, oldName);
        const newPath = path.join(this.#fontDir, newFull);
        // 检查旧文件是否存在
        if (! await this.#fileScanner.accessFile(oldPath)) throw new AppError(`字体文件 ${oldPath} 不存在`, 404);
        await this.#fileWriter.renameFile(oldPath, newPath);
        return { oldName, newName: newFull };
    }

    async setDefaultReadingFont(fontName) {
        if (!fontName) throw new UserInputError('字体名不能为空');
        // 验证字体存在
        const list = await this.#fileScanner.listFiles(this.#fontDir, { filetype: null, detail: false });
        if (!list || !list.includes(fontName)) {
            throw new AppError(`字体文件 ${fontName} 不存在`, 404);
        }
        await this.#systemConfigService.setConfig(SYSTEM_DEFAULT_FONT, 'defaultReadingFont', fontName);
        return { fontName };
    }

    async setDefaultUIFont(fontName) {
        if (!fontName) throw new UserInputError('字体名不能为空');
        const list = await this.#fileScanner.listFiles(this.#fontDir, { filetype: null, detail: false });
        if (!list || !list.includes(fontName)) {
            throw new AppError(`字体文件 ${fontName} 不存在`, 404);
        }
        await this.#systemConfigService.setConfig(SYSTEM_DEFAULT_FONT, 'defaultUIFont', fontName);
        return { fontName };
    }
}