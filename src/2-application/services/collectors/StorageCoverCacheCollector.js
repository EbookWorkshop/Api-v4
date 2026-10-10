import path from "node:path";
import { randomBytes } from "node:crypto";
import { ICollector } from "../../ports/ICollector.js";
import { COLLECT_EVENTS } from "../../constants/Event.js";

/** 表中同一 CoverImage 出现超过该值时跳过（用户要求 > 3 跳过） */
// const MAX_OCCURRENCE_SKIP = 3;
/** BookName 清洗后用于文件名的最大长度（按 Unicode 码点计） */
const MAX_BOOKNAME_LENGTH = 40;
/** 封面缓存的根目录（相对仓库） */
const CACHE_ROOT = "Cache";
/** 支持的图片后缀（推断失败时的兜底） */
const IMAGE_EXT_RE = /^(jpg|jpeg|png|gif|webp|bmp|svg|avif|ico)$/;
const DEFAULT_EXT = "jpg";

/**
 * Storage 封面本地化缓存采集器
 *
 * 职责：
 *   1. 将 Storage 中"非 http 开头"的 CoverImage 下载到本地
 *   2. 以 BookName_{rand}.{ext} 命名，存到 {repo}/Cache/{Host}/ 下
 *   3. 回写 CoverImage 为相对路径：Cache/{Host}/{newFileName}
 *
 * 注意：本任务不需要站点规则，不抓页面，只下载图片。
 *       record 由 CollectExecutor.#getPageURL 注入到 payload。
 */
export class StorageCoverCacheCollector extends ICollector {
    #fetcher;
    #storageService;
    #fileWriter;
    #emitter;

    constructor(config, rules, fetcher, services) {
        super(config, rules, fetcher, services);
        this.#fetcher = fetcher;
        this.#storageService = services.storageService;
        this.#fileWriter = services.fileWriter;
        this.#emitter = services.emitter;
    }

    /**
     * @param {Object} setting 抓取设置（timeout / userAgent）
     * @param {Object} payload
     * @param {Object} payload.record Storage 记录
     */
    async fetch(setting, payload) {
        const { record } = payload;
        if (!record) {
            return this.#resultHandle(payload, true, "没有需要处理的记录。");
        }

        const { id, BookName, Source, Host, CoverImage } = record;

        // ----- 1. 拼接完整 URL -----
        // 支持：`//a.com/b.jpg`、`/b.jpg`、`b.jpg` 三种相对形式
        let fullUrl;
        try {
            fullUrl = new URL(CoverImage, Source).href;
        } catch {
            return this.#resultHandle(
                payload, false,
                `无法解析封面地址：CoverImage=${CoverImage}，Source=${Source}`,
                { storageId: id }
            );
        }

        // ----- 2. 生成文件名 -----
        const ext = this.#guessExt(fullUrl);
        const safeName = this.#sanitizeFileName(BookName);
        const rand = randomBytes(1).toString("hex");          // 2 位十六进制
        const newFileName = `${safeName}_${rand}.${ext}`;

        // ----- 3. 目录（相对仓库）-----
        const safeHost = this.#sanitizeHost(Host);
        const relativePath = path.posix.join(CACHE_ROOT, safeHost, newFileName);

        // ----- 4. 下载 -----
        let buffer;
        try {
            buffer = await this.#fetcher.download(fullUrl, setting);
        } catch (error) {
            return this.#resultHandle(
                payload, false,
                `下载封面失败：${error.message}`,
                { storageId: id, url: fullUrl }
            );
        }
        if (!buffer || buffer.length === 0) {
            return this.#resultHandle(
                payload, false,
                `下载结果为空：${fullUrl}`,
                { storageId: id, url: fullUrl }
            );
        }

        // ----- 5. 保存到 {repo}/Cache/{Host}/{filename} -----
        try {
            await this.#fileWriter.saveFile([CACHE_ROOT, safeHost, newFileName], buffer);
        } catch (error) {
            return this.#resultHandle(
                payload, false,
                `保存封面失败：${error.message}`,
                { storageId: id, path: relativePath }
            );
        }

        // ----- 6. 回写相对路径 -----
        try {
            await this.#storageService.updateCover(id, relativePath);
        } catch (error) {
            return this.#resultHandle(
                payload, false,
                `更新 CoverImage 失败：${error.message}`,
                { storageId: id, path: relativePath }
            );
        }

        return this.#resultHandle(
            payload, true,
            `封面已缓存：${relativePath}`,
            { storageId: id, path: relativePath, url: fullUrl }
        );
    }

    // ============================================================
    // 内部工具
    // ============================================================

    /**
     * 从 URL 推断图片后缀，失败时兜底为 jpg
     * - pathname 已经去除了 query / hash
     * - jpeg 归一化为 jpg
     */
    #guessExt(url) {
        try {
            const u = new URL(url);
            const ext = path.extname(u.pathname).replace(/^\./, "").toLowerCase();
            if (IMAGE_EXT_RE.test(ext)) return ext === "jpeg" ? "jpg" : ext;
        } catch { /* ignore */ }
        return DEFAULT_EXT;
    }

    /**
     * 清洗 BookName 为可用的文件名（去非法字符 + 截断）
     *
     * 处理点：
     *   - 去除控制字符
     *   - 替换 Windows/Linux 不允许的字符：< > : " / \ | ? *
     *   - 空白合并为下划线
     *   - 去除首尾的点与下划线（Windows 不允许文件名以点结尾）
     *   - 按 Unicode 码点安全截断，避免截断代理对（emoji、罕见字等）
     *   - 兜底为 "unknown"
     */
    #sanitizeFileName(name) {
        if (!name || typeof name !== "string") return "unknown";

        let s = name
            .replace(/[\x00-\x1F\x7F]/g, "")        // 控制字符
            .replace(/[<>:"/\\|?*]/g, "_")          // 系统不允许的字符
            .replace(/\s+/g, "_");                  // 空白→下划线

        // 去除首尾的点、下划线、连字符
        s = s.replace(/^[._\-\s]+|[._\-\s]+$/g, "");

        if (!s) return "unknown";

        // 用 Array.from 安全截断（避免切到代理对的一半）
        const chars = Array.from(s);
        if (chars.length > MAX_BOOKNAME_LENGTH) {
            s = chars.slice(0, MAX_BOOKNAME_LENGTH).join("");
        }

        return s || "unknown";
    }

    /**
     * 清洗 Host，作为目录名
     * 域名正常不会包含这些字符，这里属于防御性处理
     */
    #sanitizeHost(host) {
        if (!host || typeof host !== "string") return "unknown";
        const s = host.replace(/[<>:"/\\|?*\s]+/g, "_").replace(/^[._]+|[._]+$/g, "");
        return s || "unknown";
    }

    /**
     * 统一的结果 / 事件出口（与既有 Collector 保持一致的返回契约）
     */
    #resultHandle(payload, ok, message, data = {}) {
        const ctx = { url: payload?.record?.Source };
        const event = COLLECT_EVENTS.STORAGE_COVER_CACHE;

        if (ok) {
            this.#emitter?.success(event, { ctx, data, message });
        } else {
            this.#emitter?.failure(event, { ctx, error: { message }, message });
        }
        return { payload, result: ok, message, data };
    }
}