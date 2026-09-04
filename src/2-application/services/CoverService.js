import { SHOW_BOOKNAME } from "../../3-domain/constants/BookConstants.js"
import { eXtname } from "../../5-shared/utils/site.js"
import { randomBytes } from "node:crypto";

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
    #dataFetcher;     // 实现 IDataFetcher
    #config;

    constructor(fileWriter, dataFetcher, config) {
        this.#fileWriter = fileWriter;
        this.#dataFetcher = dataFetcher;
        this.#config = config;
    }
    /** */
    set dataFetcher(fetcher) { this.#dataFetcher = fetcher; }

    /**
     * 存储封面（从来源生成并保存到静态目录）
     * @param {{ source, embedBookName }} option
     * @returns {Promise<CoverStorageResult>}
     */
    async storeCover({ source, embedBookName, bookName }) {
        let finalPath = null;
        let coverValue = null;

        // if (startsWith('#')) {
        //     // 纯色模式：直接生成纯色图片
        //     // const color = source;
        //     // const imagePath = await this.#generateSolidColorImage(color, source);
        //     // finalPath = imagePath;
        //     // coverValue = color;
        // } else 
        if (this.#isUrl(source)) {            // 从 URL 下载
            const buffer = await this.#dataFetcher.download(source);
            const savedPath = await this.#fileWriter.saveFile([this.#config.cover.path, `${bookName}_${randomBytes(2).toString('hex')}.${eXtname(source, "jpg")}`], buffer);
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
     *  为导出准备封面文件（返回可用于导出的临时文件路径）
     * TODO: 需要考虑上传base64文本串的情况
     * @param {string} coverRecord - 数据库中读取的 Ebook.CoverImg 值
     * @param {string} bookName - 书名（用于嵌入）
     * @param {object} options - 如是否强制生成新图片
     * @returns {Promise<string>} 临时图片文件路径
     */
    async prepareCoverForExport(coverRecord, bookName, options = {}) {
        return null;
        // // 1. 解析标记
        // const { path: rawPath, hasShowname } = this.#parseCoverRecord(coverRecord);

        // let finalImagePath = null;
        // if (rawPath.startsWith('#')) {
        //     // 纯色生成
        //     // finalImagePath = await this.#generateSolidColorImage(rawPath, { bookName, embedBookName: true });
        // } else {
        //     // 图片文件
        //     const absolutePath = this.#fileWriter.mapPath(rawPath);
        //     if (hasShowname) {
        //         // 需要嵌入书名 → 在图片上绘制文字，生成临时文件
        //         finalImagePath = await this.#imageProcessor.drawTextOnImage(absolutePath, bookName);
        //     } else {
        //         // 直接使用原图
        //         finalImagePath = absolutePath;
        //     }
        // }
        // return finalImagePath;
    }

    // 内部辅助方法...
    #parseCoverRecord(record) {
        if (!record) return { path: null, hasShowname: false };
        const hasShowname = record.endsWith(SHOW_BOOKNAME);
        const path = hasShowname ? record.slice(0, -9) : record;
        return { path, hasShowname };
    }

    #isUrl(str) {
        return /^https?:\/\//i.test(str);
    }
}