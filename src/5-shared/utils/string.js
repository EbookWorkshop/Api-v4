

/**
* 判断是否分隔内容
* @param {string} text 
*/
export function isDivider(text) {
    if (text == "……") return true;
    text = text.replaceAll(/[\s　 ]/g, "");
    return /^(.)\1{2,}$/.test(text);//三个以上相同的内容占一行
}