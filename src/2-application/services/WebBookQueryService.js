import { WebBookRepository } from '../../4-infrastructure/repositories/WebBookRepository.js';
import { AppError } from '../../5-shared/errors/index.js';

export class WebBookQueryService {
    /** @type {WebBookRepository} */
    #webBookRepository;
    #webBookSourceURLRepository;

    /**
     * @param {WebBookRepository} webBookRepository 
     */
    constructor(webBookRepository, webBookSourceURLRepository) {
        this.#webBookRepository = webBookRepository;
        this.#webBookSourceURLRepository = webBookSourceURLRepository;
    }

    async getBookList() {
        return this.#webBookRepository.findAll();
    }

    async getBookSources(bookId) {
        const webBook = await this.#webBookRepository.findByBookId(bookId);
        if (!webBook) throw AppError("该书籍非在线采集，没有采集信息");
        const { id } = webBook;
        return this.#webBookSourceURLRepository.findByWebBookId(id);
    }
    async getDefSources(bookId) {
        const webBook = await this.#webBookRepository.findByBookId(bookId);
        if (!webBook) throw AppError("该书籍非在线采集，没有采集信息");
        const { id, defaultIndex } = webBook;
        const sourList = await this.#webBookSourceURLRepository.findByWebBookId(id);
        if (!sourList) throw AppError("该书籍没有源数据", 404);
        if (!sourList[defaultIndex]) throw AppError("设定的默认源不存在，请重新设定。", 404);
        return sourList[defaultIndex];
    }
}
