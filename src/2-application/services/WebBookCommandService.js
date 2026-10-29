import { WebBookRepository } from '../../4-infrastructure/repositories/WebBookRepository.js';
import { getHost } from '../../5-shared/utils/site.js';

export class WebBookCommandService {
    /** @type {WebBookRepository} */
    #webBookRepository;
    #transaction;
    #ebookRepository;
    #chapterRepository;
    #webBookSourceURLRepository;
    #webBookChapterService;

    /**
     * @param {WebBookRepository} webBookRepository 
     */
    constructor(webBookRepository, transaction, ebookRepository, chapterRepository, webBookSourceURLRepository, webBookChapterService) {
        this.#webBookRepository = webBookRepository;
        this.#transaction = transaction;
        this.#ebookRepository = ebookRepository;
        this.#chapterRepository = chapterRepository;
        this.#webBookSourceURLRepository = webBookSourceURLRepository;
        this.#webBookChapterService = webBookChapterService;
    }

    async setAutoSync(bookId, autoSyncEnabled) {
        return this.#webBookRepository.update(bookId, {
            AutoSyncEnabled: autoSyncEnabled
        });
    }

    /**
     * 创建网文书籍
     * @param {*} bookInfo 
     */
    async createBook(bookInfo, setting) {
        return this.#transaction.runInTransaction(async (transaction) => {
            const { ChapterList, Introduction, ...bookDTO } = bookInfo;
            //保存书籍主数据
            const book = await this.#ebookRepository.create(bookDTO, { transaction });
            const bookId = book.id;
            const webBook = await this.#webBookRepository.create({
                WebBookName: bookDTO.BookName,
                BookId: bookId
            }, { transaction });
            await this.addSource({ bookId: book.id, defSource: true, url: setting.sourcePage, type: "index" }, transaction, webBook);
            if (setting.infoPage) this.addSource({ bookId: book.id, defSource: false, url: setting.infoPage, type: "info" }, transaction, webBook);

            //处理章节
            if (Introduction) await this.#chapterRepository.updateIntroduction({ bookId, content: Introduction }, { transaction });

            await this.#webBookChapterService.batchCreate(bookId, ChapterList, { transaction });

            return bookId;
        });
    }

    /**
     * 添加网络源
     * @param {object} setting WebBookSourceURL 的字段
     * @param {number} setting.bookId 
     * @param {boolean} setting.defSource 
     * @param {string} setting.url 
     * @param {string} setting.type 
     * @param {*} [transaction] 
     * @param {*} [webBook] WebBook 对象
     */
    async addSource({ bookId, defSource, url, type }, transaction, webBook) {
        const runInTran = async (transaction) => {
            if (!webBook) webBook = await this.#webBookRepository.findByBookId(bookId);
            if (!webBook) {/* TODO： 新增源相关信息，非网文转网文！ */ }
            const source = await this.#webBookSourceURLRepository.add({
                Path: url,
                WebBookId: webBook.id,
                Type: type
            }, { transaction });

            if (defSource) await this.#webBookRepository.update(bookId, { defaultIndex: source.id }, { transaction });//更新章节ID索引
        }
        if (!transaction) return this.#transaction.runInTransaction(runInTran);
        else return await runInTran(transaction);
    }

    async findOrCreate(bookName, source) {
        let webbook = await this.#webBookRepository.findByBookName(bookName);
        let book = await this.#ebookRepository.findByBookName(bookName);

        //创建
        if (!book) book = (await this.#ebookRepository.create({
            BookName: bookName
        })).toJSON();

        if (!webbook) {
            webbook = await this.#webBookRepository.create({
                WebBookName: bookName, isCheckRepeat: 0, BookId: book.id, defaultIndex: 0
            });
            await this.addSource({ bookId: book.id, defSource: true, url: source, type: "chapter" }, null, webbook);
            webbook = webbook.toJSON();
        }

        return { book, webbook };
    }

    /**
     * 修改源记录
     * @param {*} id 需要修改记录的ID
     * @param {object} data 
     * @param {boolean} data.domain 是否默认值
     * @param {string} data.sourceType 源类型
     * @param {string} data.url 源地址
     */
    async editSource(id, data) {
        let { domain, sourceType, url } = data;
        await this.#webBookSourceURLRepository.editById(id, { Path: url, Type: sourceType });

        if (domain) {//设置为默认值
            const webbookURL = await this.#webBookSourceURLRepository.findById(id);
            await this.#webBookRepository.updateById(webbookURL.WebBookId, { defaultIndex: id })
        }
    }

    /**
     * 修改指定域为新地址
     * @param {*} webBookId 
     * @param {*} sourceURL 
     * @param {*} type 
     */
    async updateBookSource(webBookId, sourceURL, type) {
        let sourceList = await this.#webBookSourceURLRepository.findByWebBookId(webBookId);
        const thisTypeSource = sourceList.find(item => item.Type === type);
        if (!thisTypeSource) {
            // const source = 
            await this.#webBookSourceURLRepository.add({
                Path: sourceURL,
                WebBookId: webBookId,
                Type: type
            });
            return;
        }
        const host = getHost(sourceURL);
        const thisHostURL = sourceList.find(item => item.Path.includes(host));
        this.#webBookSourceURLRepository.editById(thisHostURL.id, { Path: sourceURL });
    }
}
