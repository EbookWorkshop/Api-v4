import path from "node:path"
import { randomBytes } from "node:crypto";
import { SHOW_BOOKNAME } from "../../3-domain/constants/BookConstants.js"
import { eXtname } from "../../5-shared/utils/site.js"

/**
 * 封面存储结果
 */
class CoverStorageResult {
    /** @type {string} 要存入 Ebook.CoverImg 的原始值（可能含 #showname） */
    coverValue;
    /** @type {string} 实际存储的文件相对路径（不含标记） */
    filePath;
}

export class CoverService {
    #fileWriter;      // 实现 IFileWriter
    #dataFetcher;     // 实现 IDataFetcher fetch() ；需要下载图片时用。
    #config;
    #coverDir;

    /**
     * 
     * @param {*} fileWriter 
     * @param {IDataFetcher?} dataFetcher 仅当需要下载时提供
     * @param {*} config 
     */
    constructor(fileWriter, dataFetcher, config) {
        this.#fileWriter = fileWriter;
        this.#dataFetcher = dataFetcher;
        this.#config = config;
        this.#coverDir = this.#config.cover.path;
    }
    /** */
    set dataFetcher(fetcher) { this.#dataFetcher = fetcher; }

    /**
     * 存储封面（从来源生成并保存到静态目录）
     * @param {{ source:string, embedBookName }} option
     * @returns {Promise<CoverStorageResult>}
     */
    async storeCover({ source, embedBookName, bookName }) {
        let finalPath = null;
        let coverValue = null;

        if (this.#isUrl(source)) {            // 从 URL 下载
            const buffer = await this.#dataFetcher.download(source);
            const savedPath = await this.#fileWriter.saveFile([this.#coverDir, `${bookName}_${randomBytes(2).toString('hex')}.${eXtname(source, "jpg")}`], buffer);
            finalPath = savedPath;
            coverValue = savedPath;

            // console.debug(`已下载图片[${source}]，已写入[${savedPath}]`);

            // 如果需要嵌入书名，且当前是图片文件，则需要在 coverValue 后面附加 #showname
            if (embedBookName && finalPath && !finalPath.startsWith('#')) {
                coverValue = finalPath + SHOW_BOOKNAME;
            }
        } else {                    //线装本，直接存储彩色值或null
            finalPath = source;
            coverValue = source;
        }

        return { coverValue, filePath: finalPath };
    }

    /**
     * 为导出准备封面文件（返回可用于导出的临时文件路径）
     * @param {string} coverImg 
     * @param {boolean} embedBookName 
     * @param {Base64URLString} coverImageData 
     * @returns {{path:string,temp:boolean}} 可以使用的图片实际路径，是否临时文件（需要自己删除
     */
    async prepareCoverForExport(coverImg, embedBookName, coverImageData) {
        const warnings = [];
        if (!coverImg) coverImg = "#线装本";
        const tempDir = this.#config?.tempDir?.path;
        if (typeof (embedBookName) === "undefined" || embedBookName === null) embedBookName = coverImg?.includes(SHOW_BOOKNAME);
        coverImg = coverImg.replace(SHOW_BOOKNAME, "");

        let isUseImageData = false;
        let coverFilePath = "";
        if (coverImg.startsWith("#")) isUseImageData = true;//线装本格式，直接采用图片
        else if (embedBookName) isUseImageData = true;  //采用嵌入标题格式的封面
        else coverFilePath = this.#fileWriter.mapPath(coverImg);      //直接使用图片文件

        let temp = false;
        if (coverFilePath.endsWith(".webp") || coverFilePath.endsWith(".jpg")) {
            const newCover = await this.#fileWriter.converToPNG(coverFilePath, `${tempDir}/cover`);
            if (!newCover) warnings.push(`封面图片格式转换失败：${coverFilePath}`);
            coverFilePath = newCover;
            temp = true;
        }

        if (isUseImageData && coverImageData.length > 0) {
            coverFilePath = await this.#fileWriter.saveFile([tempDir, "cover", `cimg${randomBytes(3).toString('hex')}.png`], coverImageData, { format: "base64" });
            temp = true;
        }
        coverFilePath = path.join(this.#config.repository.path, coverFilePath);//相对仓库地址改为以仓库开始记录的地址
        return { path: coverFilePath, temp, warnings };
    }

    /**
     * 
     * @param {*} converFile 
     * @param {*} coverFileName 
     * @param {*} embelBookName 
     * @returns 
     */
    async saveCoverAndGetFilePath(converFile, coverFileName, embelBookName) {
        const newFileName = `${coverFileName}_${converFile.originalFilename}`;
        let filePath = await this.#fileWriter.moveFile(converFile.filepath, [this.#coverDir, newFileName]);
        if (embelBookName) filePath += SHOW_BOOKNAME;
        return filePath;
    }

    // 内部辅助方法...
    #normalizeCoverValue(coverValue) {
        if (!coverValue || typeof coverValue !== 'string') return null;

        const value = coverValue.replace(SHOW_BOOKNAME, '');

        if (value.startsWith('#')) return { type: 'color', value };
        if (this.#isUrl(value)) return { type: 'url', value };

        return { type: 'file', path: value };
    }

    async isSameCoverFile(a, b) {
        const na = this.#normalizeCoverValue(a);
        const nb = this.#normalizeCoverValue(b);

        return !!(
            na &&
            nb &&
            na.type === 'file' &&
            nb.type === 'file' &&
            na.path === nb.path
        );
    }

    async deleteCoverFile(coverValue, { except } = {}) {
        const target = this.#normalizeCoverValue(coverValue);

        // 颜色值、URL、空值都不删物理文件
        if (!target || target.type !== 'file') return false;

        if (except) {        // 新旧是同一个文件，不删
            const exceptTarget = this.#normalizeCoverValue(except);
            if (
                exceptTarget?.type === 'file' &&
                exceptTarget.path === target.path
            ) {
                return false;
            }
        }

        try {
            await this.#fileWriter.deleteFile(target.path);
            return true;
        } catch (err) {
            if (err.code === 'ENOENT') return false;
            throw err;
        }
    }

    #isUrl(str) {
        return /^https?:\/\//i.test(str);
    }
}