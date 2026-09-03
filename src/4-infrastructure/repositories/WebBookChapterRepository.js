import { Op } from "sequelize";
export class WebBookChapterRepository {
    #WebBookChapterModel;

    constructor(sequelize) {
        this.#WebBookChapterModel = sequelize.models.WebBookChapter;
    }

    async addChapter(chapter,option) {
        return this.#WebBookChapterModel.create(chapter,option);
    }
}
