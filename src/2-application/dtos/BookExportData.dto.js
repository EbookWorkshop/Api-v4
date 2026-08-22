/**
 * 装配导出用的图书数据结构
 */
export class BookExportData {
    /**
     * @param {Object} params
     * @param {string} params.title - 书名
     * @param {string} params.author - 作者
     * @param {string|File} params.cover - 封面
     * @param {string} params.introduction - 简介
     * @param {Object} params.setting - 格式、排版、字体等设置
     * @param {Array<{title: string, introduction: string}>} params.volumes - 卷列表
     * @param {Array<{title: string, content: string}>} params.chapters - 章节列表
     */
    constructor({ title, author, cover, introduction, volumes, chapters, setting }) {
        this.title = title;
        this.author = author;
        this.cover = cover;
        this.introduction = introduction;
        this.setting = setting;
        this.volumes = volumes;
        this.chapters = chapters;
    }
}