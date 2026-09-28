import { ChapterRepository } from '../../4-infrastructure/repositories/ChapterRepository.js';
import { ITransaction } from "../ports/ITransaction.js"
// import { AppError } from "../../5-shared/errors/index.js"

export class ChapterCommandService {
    /** @type {ChapterRepository} */
    #chapterRepository;
    #indexRepository;
    #volumeRepository;
    /** @type {ITransaction} */
    #transactionManager;

    /**
     * @param {ChapterRepository} chapterRepository 
     * @param {ITransaction} transactionManager 
     */
    constructor(chapterRepository, indexRepository, volumeRepository, transactionManager) {
        this.#chapterRepository = chapterRepository;
        this.#indexRepository = indexRepository;
        this.#volumeRepository = volumeRepository;
        this.#transactionManager = transactionManager;
    }

    /**
     * 从卷中批量移出章节
     * @param {number[]} chapterIds 章节ID列表
     * @returns 
     */
    async removeChaptersFromVolume(chapterIds) {
        return await this.#chapterRepository.removeChaptersFromVolume(chapterIds);
    }

    /**
     * 批量移入章节到卷中
     * @param {*} volumeId 
     * @param {*} chapterIds 
     * @returns 
     */
    async moveChaptersToVolume(volumeId, chapterIds) {
        return await this.#chapterRepository.moveChaptersToVolume(volumeId, chapterIds);
    }

    /**
     * 按卷梳理章节顺序
     * 避免跨卷错乱顺序
     * @param {*} bookId 
     */
    async sortChaptersOnVolumes(bookId) {
        const volumes = await this.#volumeRepository.findByBookId(bookId);
        if (!volumes || volumes.length <= 0) return false;//无分卷信息，无法梳理

        const index = await this.#indexRepository.findByBookId(bookId);

        const newOrder = [];
        for (const v of volumes) {
            const chapOnVolume = index.filter(c => c.VolumeId == v.VolumeId);
            chapOnVolume.sort((a, b) => a.OrderNum - b.OrderNum);
            newOrder.push(...chapOnVolume);
        }
        const newOrderId = newOrder.map(c => c.IndexId);
        const chapOutVolume = index.filter(c => !newOrderId.includes(c.IndexId));
        newOrder.push(...chapOutVolume);
        let curOrder = 1;
        return this.#chapterRepository.updateOrder(newOrder.map(({ IndexId }) => {
            return {
                indexId: IndexId, newOrder: curOrder++
            }
        }))
    }


    /**
     * 插入或更新章节
     * @param {Object} chapter 章节信息
     * @param {number} [chapter.IndexId] 章节ID
     * @param {number} [chapter.BookId] 书籍ID
     * @param {string} [chapter.Title] 章节标题     
     * @param {string} [chapter.Content] 章节正文
     * @param {number} [chapter.VolumeId] 卷ID
     * @param {number} [chapter.OrderNum] 章节排序号
     * @param {number} [chapter.id] 章节ID
     */
    async upsertChapter(chapter) {
        const { IndexId = 0, ...chp } = chapter;
        const id = IndexId * 1;
        if ((isNaN(id) || id <= 0) && (chapter.BookId ?? 0) > 0)
            return await this.#chapterRepository.addChapter(chp);
        else if (id > 0) {
            return await this.#chapterRepository.updateChapter({ ...chp, id });
        }
        return false;
    }

    /**
     * 根据ID删除章节
     * @param {*} chapterId 需要删除的章节
     * @returns 
     */
    async deleteChapter(chapterId) {
        return await this.#chapterRepository.deleteChapter(chapterId);
    }

    /**
     * 批量插入章节
     * @param {object} info 
     * @param {number} info.bookId 将插入的书籍
     * @param {number|undefined} info.volumeId 插到指定卷中，-1为不设置卷
     * @param {Array<{Content:string,OrderNum:number,Title:string,VolumeId}>} info.chapters 章节列表
     */
    async batchInsertChapters({ bookId, volumeId, chapters }) {
        return await this.#chapterRepository.batchInsertChapters({ bookId, volumeId, chapters });
    }

    /**
     * 批量更新章节顺序
     * @param {Array<{indexId,newOrder}>} orderData 新的排序配置
     * @returns 
     */
    async updateOrder(orderData) {
        return this.#chapterRepository.updateOrder(orderData);
    }

    /**
     * 切换是否隐藏章节
     * @param {number} chapterId 章节ID
     * @returns 
     */
    async toggleHide(chapterId) {
        return this.#chapterRepository.toggleHide(chapterId);
    }

    /**
     * 将指定章节设置为简介
     * 并将已有的简介章节放出
     * @param {*} chapterId 章节ID
     * @returns 
     */
    async setAsIntroduction(chapterId) {
        return this.#transactionManager.runInTransaction((transaction) => {
            return this.#chapterRepository.setAsIntroduction(chapterId, { transaction });
        });
    }

    async restructureChapters(bookId, settings) {
        const _setChapter = (baseCp) => {
            let chapterSetting = {
                id: baseCp.chapterId,
                updateTime: new Date()
            };
            if (baseCp.bookId) chapterSetting.BookId = baseCp.bookId;
            if (baseCp.title) chapterSetting.Title = baseCp.title;
            if (baseCp.content) chapterSetting.Content = baseCp.content;
            if (baseCp.orderNum) chapterSetting.OrderNum = baseCp.orderNum;
            if (baseCp.volumeId) chapterSetting.VolumeId = baseCp.volumeId;
            return chapterSetting;
        }

        try {
            await this.#transactionManager.runInTransaction(async (t) => {
                const baseCp = settings?.baseChapter;
                if (baseCp?.chapterId) {
                    const chapterSetting = _setChapter(baseCp);
                    await this.#chapterRepository.updateChapter(chapterSetting, { transaction: t });
                    const operations = settings?.operations;
                    if (!operations || operations.length <= 0) return;  //只修改一章的情况

                    //计算总章节偏移量：
                    let moveLength = operations.filter(item => item.operationType !== "delete").reduce((sum, item) => sum + item.chapters.length, 0);

                    //基准章节后续章节后移
                    await this.#chapterRepository.batchMoveOrder(bookId, baseCp.orderNum, moveLength, { transaction: t });
                }

                for (let chap of settings?.operations) {
                    for (let cp of chap.chapters) {
                        const curChapSetting = chap.operationType !== "delete" ? _setChapter(cp) : { id: -1 };
                        switch (chap.operationType) {        //[update, delete, create]
                            case "delete":
                                await this.#chapterRepository.deleteChapter(cp, { transaction: t });
                                break;
                            case "create":
                                curChapSetting.BookId = bookId;
                                await this.#chapterRepository.addChapter(curChapSetting, { transaction: t });
                                break;
                            case "update":
                                await this.#chapterRepository.updateChapter(curChapSetting, { transaction: t });
                                break;
                        }
                    }
                }
            });
        } catch (err) {
            throw err;
        }
    }
}
