-- 测试做坏了的数据库结构，修复不了就迁移数据
-- v3.12.0 -> v4.0.1

INSERT into  Ebooks(id,BookName,Author,CoverImg,Hotness,TotalWord,createdAt,updatedAt)
 select id,BookName,Author,CoverImg,Hotness,TotalWord,createdAt,updatedAt from old.Ebooks;
INSERT into  Volumes select * from old.Volumes;
INSERT into  EbookChapters select * from old.EbookChapters;
INSERT into  WebBooks select * from old.WebBooks;
INSERT into  WebBookChapters select * from old.WebBookChapters;
--INSERT into  WebBookIndexSourceURLs select * from old.WebBookIndexSourceURLs;
INSERT into  WebBookSourceURLs(id,Path,WebBookId,createdAt,updatedAt) select * from old.WebBookIndexSourceURLs;
INSERT into  PDFBooks select * from old.PDFBooks;
INSERT into  SystemConfigs select * from old.SystemConfigs where [Group] != 'database_version';
INSERT into  ReviewRules select * from old.ReviewRules;
INSERT into  ReviewDictionaries select * from old.ReviewDictionaries;
INSERT into  ReviewRuleUsings select u.* from old.ReviewRuleUsings u INNER JOIN old.Ebooks b on u.BookId = b.id;

-- 爬站规则配置
INSERT into  RuleForWebs select * from old.RuleForWebs;

-- 书本目录页
INSERT into  WebBookChapterURLs select b.* from old.WebBookChapterURLs b INNER JOIN old.WebBookChapters a on a.id = b.WebBookIndexId;
 
INSERT into  Tags select * from old.Tags;
INSERT into  EBookTags select * from old.EBookTags;
INSERT into  Bookmarks select * from old.Bookmarks;

