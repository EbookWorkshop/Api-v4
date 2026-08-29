import { BookmarkRepository } from '../../4-infrastructure/repositories/BookmarkRepository.js';
import { AppError, UserInputError } from "../../5-shared/errors/index.js"

export class BookmarkService {
    /** @type {BookmarkRepository} */
    #bookmarkRepository;

    /**
     * @param {BookmarkRepository} bookmarkRepository 
     */
    constructor(bookmarkRepository) {
        this.#bookmarkRepository = bookmarkRepository;
    }

    async listBookmarks(bookid) {
        return this.#bookmarkRepository.findAll(bookid);
    }

    async addBookmark(chapterId) {
        return this.#bookmarkRepository.create(chapterId);
    }

    async deleteBookmark(id) {
        return this.#bookmarkRepository.delete(id);
    }
}