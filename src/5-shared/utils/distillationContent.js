
/**
 * 定位不匹配的符号所在位置
 * @param {string[][]} punctuation 一对符号组 —— 如 [['（', '）'],...]
 * @param {string} content 
 * @returns {Array<string>} 出现不匹配符号的文本片段，
 */
export function distillationContent(punctuation, content) {
    //删除成组的符号
    let tempCont = content.replace(new RegExp(`${punctuation[0]}[^${punctuation[0]}${punctuation[1]}]+${punctuation[1]}`, 'mg'), '…');//“[^“”]+”

    //删除没符号的部分 …… 不删，用于更好的定位在文中的关系
    // tempCont = tempCont.replace(new RegExp(`^[^${punctuation[0]}${punctuation[1]}]+$`, 'mg'), '…');//[^“”]+

    //删除空行
    tempCont = tempCont.replace(/^[…\s]+?$\n?/mg, '…');//保留点换行，不删完，利于分割

    let result = [];
    let target = tempCont.matchAll(new RegExp(`${punctuation[0]}|${punctuation[1]}`, 'g'));
    let targetNext = target.next();
    const PIX = 30;
    while (!targetNext.done) {
        let index = targetNext.value.index;
        let start = Math.max(index - PIX / 2, 0);

        let sub = tempCont.substring(start, index + PIX);
        result.push(sub);

        targetNext = target.next();
    }

    return result;
}
