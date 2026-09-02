export class WebBookChapterURLRepository {
    #WebBookChapterURLModel;
    #WebBookChapterModel;
    #sequelize;

    constructor(sequelize) {
        this.#WebBookChapterURLModel = sequelize.models.WebBookChapterURL;
        this.#WebBookChapterModel = sequelize.models.WebBookChapter;
        this.#sequelize = sequelize;
    }

    /**
     * 将记录的地址从from改到to
     * @param {*} from 
     * @param {*} to 
     */
    async changeHosts(from, to, { transaction }) {
        return await this.#sequelize.query(`
            update [WebBookChapterURLs] 
            SET Path = REPLACE(Path, :from, :to);`, {
            replacements: { from, to },
            transaction
        })
    }

    /**
     * 根据章节ID获取来源网址信息
     * @param {*} chapterId 
     * @returns 
     */
    async queryURLByChapterId(chapterId) {
        return this.#WebBookChapterURLModel.findAll({
            include: [{
                model: this.#WebBookChapterModel,
                where: { IndexId: chapterId },
                attributes: [], // 不需要查章节字段，只用来做过滤
                require: true   // 转为 INNER JOIN，确保关联存在才返回     
            }],
            attributes: { exclude: ["createdAt", "updatedAt"] },
            raw: true
        })
    }

    /**
     * 更新网址
     * @param {*} id 记录ID
     * @param {*} url 
     * @returns 
     */
    async updateSourcePath(id, url) {
        return this.#WebBookChapterURLModel.update({
            Path: url,
        }, {
            where: { id: id }
        });
    }
}