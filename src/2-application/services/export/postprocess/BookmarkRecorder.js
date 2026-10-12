export class BookmarkRecorder {
    #bookmarkService;

    /**
     * @param {import('../../BookmarkService.js').BookmarkService} bookmarkService
     */
    constructor(bookmarkService) {
        this.#bookmarkService = bookmarkService;
    }

    /**
     * 记录最后一章书签
     * @param {number} chapterId
     */
    async record(chapterId) {
        if (!chapterId) return;
        await this.#bookmarkService.addBookmark(chapterId);
    }
}