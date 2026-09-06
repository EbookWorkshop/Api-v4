/**
 * 字符分析统计 - 从旧项目迁移
 */
export class SmartCharacterAnalyzer {
    constructor() {
        this.commonBlocks = new Set([
            'CJK Unified Ideographs',
            'CJK Unified Ideographs Extension',
            'Basic Latin',
            'Latin-1 Supplement',
            'General Punctuation',
            'CJK Symbols and Punctuation',
            'Full Width Forms',
            'Half Width Forms',
            'Numbers',
        ]);

        this.suspiciousBlocks = new Set([
            'CJK Compatibility',
            'CJK Compatibility Ideographs',
            'CJK Compatibility Forms',
            'Kangxi Radicals',
            'CJK Radicals Supplement',
            'Private Use Area',
            'Variation Selectors',
            'Enclosed Alphanumerics',
            'Enclosed CJK Letters and Months',
        ]);

        this.specialChars = {
            0x2028: { en: 'Line Separator', zh: '行分隔符' },
            0x2029: { en: 'Paragraph Separator', zh: '段落分隔符' },
            0x0085: { en: 'Next Line', zh: '下一行' },
            0x200C: { en: 'Zero Width Non-Joiner', zh: '零宽非连接符' },
            0x200D: { en: 'Zero Width Joiner', zh: '零宽连接符' },
            0x200E: { en: 'Left-To-Right Mark', zh: '左至右标记' },
            0x200F: { en: 'Right-To-Left Mark', zh: '右至左标记' },
            0x202A: { en: 'Left-To-Right Embedding', zh: '左至右嵌入' },
            0x202B: { en: 'Right-To-Left Embedding', zh: '右至左嵌入' },
            0x202C: { en: 'Pop Directional Formatting', zh: '弹出方向格式化' },
            0x202D: { en: 'Left-To-Right Override', zh: '左至右覆盖' },
            0x202E: { en: 'Right-To-Left Override', zh: '右至左覆盖' },
            0x2060: { en: 'Word Joiner', zh: '词连接符' },
        };
    }

    getUnicodeBlock(char) {
        const codePoint = char.codePointAt(0);
        const blocks = [
            { name: 'Basic Latin', start: 0x0000, end: 0x007F },
            { name: 'CJK Compatibility', start: 0xF900, end: 0xFAFF },
            { name: 'CJK Compatibility Forms', start: 0xFE30, end: 0xFE4F },
            { name: 'Kangxi Radicals', start: 0x2F00, end: 0x2FDF },
            { name: 'CJK Radicals Supplement', start: 0x2E80, end: 0x2EFF },
            { name: 'CJK Unified Ideographs', start: 0x4E00, end: 0x9FFF },
            { name: 'Private Use Area', start: 0xE000, end: 0xF8FF },
            { name: 'CJK Symbols and Punctuation', start: 0x3000, end: 0x303F },
            { name: 'General Punctuation', start: 0x2000, end: 0x206F },
            { name: 'Full Width Forms', start: 0xFF00, end: 0xFFEF },
            { name: 'Half Width Forms', start: 0xFF00, end: 0xFFEF },
        ];
        for (const block of blocks) {
            if (codePoint >= block.start && codePoint <= block.end) {
                return block.name;
            }
        }
        return 'Other';
    }

    analyzeCharacterFrequency(text) {
        const freqMap = new Map();
        for (const char of text) {
            if (char.trim() === '') continue;
            const block = this.getUnicodeBlock(char);
            freqMap.set(char, (freqMap.get(char) || 0) + 1);
        }
        return freqMap;
    }

    detectSuspiciousCharacters(text) {
        const charMap = new Map();
        const freqMap = this.analyzeCharacterFrequency(text);
        const totalChars = Array.from(freqMap.values()).reduce((sum, count) => sum + count, 0);

        for (let i = 0; i < text.length; i++) {
            const char = text[i];
            const charCodePoint = char.codePointAt(0);
            if (char.trim() === '') continue;

            const block = this.getUnicodeBlock(char);
            const frequency = freqMap.get(char);
            const frequencyPercent = (frequency / totalChars) * 100;

            let suspicionLevel = 0;
            const reasons = [];

            if (this.suspiciousBlocks.has(block)) {
                suspicionLevel += 3;
                reasons.push(`位于可疑Unicode区块: ${block}`);
            }

            if (!this.commonBlocks.has(block) && !this.suspiciousBlocks.has(block)) {
                suspicionLevel += 1;
                reasons.push(`位于非常见区块: ${block}`);
            }

            if (block === 'Private Use Area') {
                suspicionLevel += 4;
                reasons.push('位于私有使用区域（可能显示异常）');
            }

            if (block === 'General Punctuation' && this.specialChars[charCodePoint]) {
                suspicionLevel += 2;
                reasons.push(`位于不可见标点符号区: ${this.specialChars[charCodePoint].en}`);
            }

            if (suspicionLevel >= 2) {
                const start = Math.max(0, i - 15);
                const end = Math.min(text.length, i + 15);
                const context = text.slice(start, end).replace(/\n/g, '\\n');

                if (charMap.has(char)) {
                    const existing = charMap.get(char);
                    const reasonSet = new Set([...existing.reasons, ...reasons]);
                    existing.reasons = Array.from(reasonSet);
                    existing.context.push(context);
                    if (suspicionLevel > existing.suspicionLevel) {
                        existing.suspicionLevel = suspicionLevel;
                    }
                    charMap.set(char, existing);
                } else {
                    charMap.set(char, {
                        character: char,
                        codePoint: `U+${charCodePoint.toString(16).toUpperCase().padStart(4, '0')}`,
                        unicodeBlock: block,
                        suspicionLevel,
                        frequency,
                        frequencyPercent: frequencyPercent.toFixed(3),
                        reasons,
                        context: [context],
                    });
                }
            }
        }
        return Array.from(charMap.values()).sort((a, b) => b.suspicionLevel - a.suspicionLevel);
    }
}