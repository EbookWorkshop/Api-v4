import Scope from "./scope.js";

/**
 * 设置模型之间的关系（领域层职责）
 * 必须在所有实体通过 sequelize.define 注册完成后调用
 * @param {Object} models - sequelize.models 对象
 */
export function setupAssociations(models) {

    // Ebook <-- --> Volume
    models.Ebook.hasMany(models.Volume, { foreignKey: 'BookId', sourceKey: 'id', as: "Volumes", onDelete: 'CASCADE' });
    models.Volume.belongsTo(models.Ebook, { foreignKey: 'BookId', targetKey: 'id', as: "Ebook" });

    // Volume <-- --> EbookChapter
    models.Volume.hasMany(models.EbookChapter, { foreignKey: 'VolumeId', sourceKey: 'id', as: "EbookChapter", onDelete: 'SET NULL' });
    models.EbookChapter.belongsTo(models.Volume, { foreignKey: 'VolumeId', targetKey: 'id', as: "Volume", onDelete: 'SET NULL' });

    // Ebook <-- --> EbookChapter
    models.Ebook.hasMany(models.EbookChapter, { foreignKey: 'BookId', sourceKey: 'id', as: "EbookChapter", onDelete: 'CASCADE' });
    models.EbookChapter.belongsTo(models.Ebook, { foreignKey: 'BookId', targetKey: 'id', as: "Ebook" });

    // Ebook <-- --> WebBook
    models.Ebook.hasOne(models.WebBook, { foreignKey: 'BookId', sourceKey: 'id', onDelete: 'CASCADE' });
    models.WebBook.belongsTo(models.Ebook, { foreignKey: 'BookId', targetKey: 'id' });

    // WebBook <-- --> WebBookIndexSourceURL
    models.WebBook.hasMany(models.WebBookIndexSourceURL, { onDelete: 'CASCADE' });
    models.WebBookIndexSourceURL.belongsTo(models.WebBook);

    // EbookChapter <-- --> WebBookChapter
    models.EbookChapter.hasOne(models.WebBookChapter, { foreignKey: 'IndexId', sourceKey: 'id', as: "WebBookChapter", onDelete: 'CASCADE' });
    models.WebBookChapter.belongsTo(models.EbookChapter, { foreignKey: 'IndexId', targetKey: 'id', as: "EbookChapter" });


    // WebBookChapter <-- --> WebBookIndexURL
    models.WebBookChapter.hasMany(models.WebBookIndexURL, { foreignKey: "WebBookIndexId", sourceKey: "id", onDelete: 'CASCADE' });
    models.WebBookIndexURL.belongsTo(models.WebBookChapter, { foreignKey: 'WebBookIndexId', targetKey: "id" });

    // Ebook <-- --> PDFBook
    // models.Ebook.hasOne(models.PDFBook, { foreignKey: 'BookId', sourceKey: 'id', onDelete: 'CASCADE' });
    // models.PDFBook.belongsTo(models.Ebook, { foreignKey: 'BookId', targetKey: 'id' });

    // ReviewRule <-- --> ReviewRuleUsing <-- --> Ebook
    models.ReviewRule.hasMany(models.ReviewRuleUsing, { foreignKey: 'RuleId', sourceKey: 'id', onDelete: 'CASCADE' });
    models.ReviewRuleUsing.belongsTo(models.ReviewRule, { foreignKey: 'RuleId', targetKey: 'id' });
    models.Ebook.hasMany(models.ReviewRuleUsing, { foreignKey: 'BookId', sourceKey: 'id', onDelete: 'CASCADE' });
    models.ReviewRuleUsing.belongsTo(models.Ebook, { foreignKey: 'BookId', targetKey: 'id', onDelete: 'CASCADE' });


    // Ebook <-- --> EBookTag <-- --> Tag
    models.Ebook.hasMany(models.Tag, { foreignKey: 'BookId', sourceKey: 'id', onDelete: 'CASCADE' });
    models.Tag.belongsTo(models.Ebook, { foreignKey: 'BookId', targetKey: 'id' });
    models.Tag.belongsTo(models.Tag, { foreignKey: 'TagId', targetKey: 'id' });
    models.Tag.hasMany(models.Tag, { foreignKey: 'TagId', sourceKey: 'id', onDelete: 'CASCADE' });

    // EbookChapter <-- --> Bookmark
    models.EbookChapter.hasOne(models.Bookmark, { foreignKey: { name: 'IndexId', unique: true }, sourceKey: 'id', as: "EbookChapter", onDelete: 'CASCADE' });
    models.Bookmark.belongsTo(models.EbookChapter, { foreignKey: "IndexId" });

    Scope(models);
}