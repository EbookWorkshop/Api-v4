export class BookmarkRepository {
    #BookmarkModel;
    #ChapterModel;
    #VolumeModel;
    #EbookModel;

    constructor(sequelize) {
        this.#BookmarkModel = sequelize.models.Bookmark;
        this.#ChapterModel = sequelize.models.EbookChapter;
        this.#VolumeModel = sequelize.models.Volume;
        this.#EbookModel = sequelize.models.Ebook;
    }

    async findAll(bookId) {
        const where = bookId ? { BookId: bookId } : {};
        const bms = await this.#BookmarkModel.findAll({
            include: [{
                model: this.#ChapterModel,
                as: 'EbookChapter',
                attributes: ['Title'],
                include: [{
                    model: this.#EbookModel,
                    attributes: ['BookName'],
                    as: 'Ebook'
                }, {
                    model: this.#VolumeModel,
                    attributes: ['Title'],
                    require: false,
                    as: 'Volume'
                }]
            }],
            where,
            order: [['createdAt', 'DESC']],
        })
        return bms.map(b => {
            return {
                id: b.id,
                createdAt: b.createdAt.toLocaleString(),
                BookName: b.EbookChapter?.Ebook?.BookName,
                Title: b.EbookChapter?.Title,
                ChapterId: b.IndexId,
                VolumeName: b.EbookChapter.Volume?.Title,
            };
        });
    }

    async create(chapterId) {
        return this.#BookmarkModel.create({
            IndexId: chapterId
        });
    }

    async delete(id) {
        return this.#BookmarkModel.destroy({
            where: { id: id }
        });
    }
}