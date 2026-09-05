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
}
export const RuleName = {
    BookName: "BookName",
    ChapterList: "ChapterList",
    CapterTitle: "CapterTitle",
    Content: "Content",
    BookCover: "BookCover",
    IndexNextPage: "IndexNextPage",
    ContentNextPage: "ContentNextPage",
    Author: "Author",
    Introduction: "Introduction",
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
export const RULE_INFO_INDEX = [].concat(RULE_INFO, RULE_INDEX)
export const RULE_CHAPTER = [
    RuleName.CapterTitle,
    RuleName.Content,
    RuleName.ContentNextPage,
]

export const RULE_GROUP_SETTING = {
    [RULE_GROUP.INFO_PAGE]: RULE_INFO,
    [RULE_GROUP.INDEX_PAGE]: RULE_INDEX,
    [RULE_GROUP.INFO_INDEX_PAGE]: RULE_INFO_INDEX,
    [RULE_GROUP.CHAPTER_PAGE]: RULE_CHAPTER,
}

export const RULE_ALL = [].concat(RULE_INFO_INDEX, RULE_CHAPTER)