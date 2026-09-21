

export const WORD_NOISE_RE = /[\r\n\s\t,\.!?<>'"，。\[\]『』「」:：“”《》！？…—~\*]/g;

export function countWords(content) {
    return (content || '').replace(WORD_NOISE_RE, '').length;
}

export function countParagraphs(content) {
    return (content?.match(/\n+/g)?.length ?? 0) + 1;
}

export function estimateMinutes(words, wpm) {
    return Number((words / wpm).toFixed(1));
}