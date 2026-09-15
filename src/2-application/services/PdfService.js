import path from "node:path"

export class PdfService {
    #pdfGenerator;
    #chapterService;
    #fileScanService;
    #config;
    constructor(pdfGenerator, chapterService, fileScanService, config) {
        this.#pdfGenerator = pdfGenerator;
        this.#chapterService = chapterService;
        this.#fileScanService = fileScanService;
        this.#config = config;
    }

    async viewChapter(chapterId, setting) {
        const chapt = await this.#chapterService.getChapterById(chapterId);

        return this.#pdfGenerator.createBuffer({
            title: chapt.Title,
            content: chapt.Content,
        }, await this.#handleSetting(setting))
    }

    async viewContent(content, setting) {
        return this.#pdfGenerator.createBuffer({
            title: "",
            content: content,
        }, await this.#handleSetting(setting))
    }

    async #handleSetting(setting) {
        let { fontfamily, fontsize } = setting;
        let font = {}
        if (fontfamily) {
            let fontFile = fontfamily;
            if (!fontfamily.includes(".")) {
                fontFile = await this.#fileScanService.findFileByBasename(this.#config.font.path, fontfamily);
            }
            const filePath = path.join(this.#config.repository.path, this.#config.font.path, fontFile);
            font = {
                file: fontFile,
                dir: this.#config.font.path,
                path: filePath,
            }
        }
        return { fontSize: fontsize ? Number(fontsize) : undefined, font, publisher: `EBook Workshop v${this.#config.version}` };
    }
}