
export class WebBookSyncService {
    #webBookChapterRepository;
    #taskScheduler;

    constructor(webBookChapterRepository, taskScheduler) {
        this.#webBookChapterRepository = webBookChapterRepository;
        this.#taskScheduler = taskScheduler;
    }

    //抽取一个空章节更新
    async SyncOneChapter() {
        const upChap = await this.#webBookChapterRepository.findLatestEmpty();
        if (!upChap.id) return;
        console.debug(`【${new Date()}】自动更新章节任务即将进行：`, upChap.BookName, upChap.Title, upChap.id)
        return this.#taskScheduler.submitUpdateChapters([upChap.id], {
            bookId: upChap.BookId, bookName: upChap.BookName, highPriority: "lazy", keepsilent: true
        });
    }
}