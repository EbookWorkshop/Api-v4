
export class WebBookSyncService {
    #taskScheduler;
    #webBookRepository;
    #webBookChapterRepository;

    constructor(taskScheduler, webBookChapterRepository, webBookRepository) {
        this.#taskScheduler = taskScheduler;
        this.#webBookRepository = webBookRepository;
        this.#webBookChapterRepository = webBookChapterRepository;
    }

    //抽取一个空章节更新
    async SyncOneChapter() {
        const upChap = await this.#webBookChapterRepository.findLatestEmpty();
        if (!upChap.id) return;
        console.debug(`【${new Date().toLocaleString()}】自动更新章节任务即将进行：`, upChap.BookName, upChap.Title, upChap.id)
        return this.#taskScheduler.submitUpdateChapters([upChap.id], {
            bookId: upChap.BookId, bookName: upChap.BookName, highPriority: "lazy", keepsilent: true
        });
    }

    /**
     * 更新书籍目录
     */
    async SyncIndex(paylaod) {
        //paylaod= {tagId:22}
        const bookId = await this.#webBookRepository.findOldest(paylaod);
        console.log("WebBookSyncService::SyncIndex", paylaod, bookId);

        this.#taskScheduler.submitUpdateIndex({
            bookId, keepsilent: true,
        })
        await this.#webBookRepository.update(bookId, { AutoSyncEnabled: true });//开启自动抓取章节，主要是触发updatedAt，调整排队顺序到队尾
    }
}