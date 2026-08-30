import { WebBookRepository } from '../../4-infrastructure/repositories/WebBookRepository.js';
import { AppError } from "../../5-shared/errors/index.js"

export class WebBookCommandService {
    /** @type {WebBookRepository} */
    #webBookRepository;

    /**
     * @param {WebBookRepository} webBookRepository 
     */
    constructor(webBookRepository) {
        this.#webBookRepository = webBookRepository;
    }

}