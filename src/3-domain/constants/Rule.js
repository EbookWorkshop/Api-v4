/**
 * 按页划分的规则组
 */
export const RULE_GROUP = {
    /** 书籍信息页 */
    INFO_PAGE: Symbol("INFO_PAGE"),
    /** 书籍目录页 */
    INDEX_PAGE: Symbol("INDEX_PAGE"),
    /** 信息、目录混合 */
    INFO_INDEX_PAGE: Symbol("INFO_INDEX_PAGE"),
    /** 章节正文 */
    CHAPTER_PAGE: Symbol("CHAPTER_PAGE"),
    /** 章节正文 （包含全部信息）*/
    CHAPTER_PAGE_ALL: Symbol("CHAPTER_PAGE_ALL"),
    /** 获取书本类表 */
    BOOK_LIST: Symbol("BOOK_LIST"),
    /** 更新书本列表封面 */
    STORAGE_COVER: Symbol("STORAGE_COVER"),
}
export const RuleName = {
    BookName: "BookName",
    ChapterList: "ChapterList",
    ChapterTitle: "ChapterTitle",
    Content: "Content",
    BookCover: "BookCover",
    IndexNextPage: "IndexNextPage",
    ContentNextPage: "ContentNextPage",
    ChapterNextPage: "ChapterNextPage",
    Author: "Author",
    Introduction: "Introduction",
    BookList: "BookList",
    BookListNext: "BookListNext",
}
export const RuleCommon = {
    Timeout: "Timeout",
    UserAgent: "UserAgent",
    Scraping: "Scraping",
    Dictionary: "Dictionary",
}
export const RULE_INFO = [
    RuleName.BookName,
    RuleName.Author,
    RuleName.BookCover,
    RuleName.Introduction,
]
export const RULE_INDEX = [
    RuleName.IndexNextPage,
    RuleName.ChapterList,
]
export const RULE_BOOK_LIST = [
    RuleName.BookList,
    RuleName.BookListNext,
]
export const RULE_INFO_INDEX = RULE_INFO.concat(RULE_INDEX)
export const RULE_CHAPTER = [
    RuleName.ChapterTitle,
    RuleName.Content,
    RuleName.ContentNextPage,
]
export const CHAPTER_PAGE_ALL = [
    RuleName.ChapterTitle,
    RuleName.Content,
    RuleName.ContentNextPage,
    RuleName.ChapterNextPage,
]
export const RULE_STORAGE_COVER = [RuleName.BookCover];

export const RULE_GROUP_SETTING = {
    [RULE_GROUP.INFO_PAGE]: RULE_INFO,
    [RULE_GROUP.INDEX_PAGE]: RULE_INDEX,
    [RULE_GROUP.INFO_INDEX_PAGE]: RULE_INFO_INDEX,
    [RULE_GROUP.CHAPTER_PAGE]: RULE_CHAPTER,
    [RULE_GROUP.CHAPTER_PAGE_ALL]: CHAPTER_PAGE_ALL,
    [RULE_GROUP.BOOK_LIST]: RULE_BOOK_LIST,
    [RULE_GROUP.STORAGE_COVER]: RULE_STORAGE_COVER,
}

// export const RULE_ALL = RULE_INFO_INDEX.concat(RULE_CHAPTER).concat(RULE_BOOK_LIST)
export const RULE_ALL = [...RULE_INFO_INDEX, ...CHAPTER_PAGE_ALL, ...RULE_BOOK_LIST];