
/**
 * 根据多个属性进行去重
 * ## 注意： 比较的属性将转换为字符串比较
 * @param {Array<Object>} items 比较的对象
 * @param {Array<string>} keys 需要同时比较的多个key
 */
export function deduplicateByMultKey(items, keys) {
    if (!Array.isArray(keys) || keys.length == 0) return items;
    const keySet = new Set();
    const result = [];
    for (const item of items) {
        const key = keys.map(key => item[key]).join("|");
        if (keySet.has(key)) continue;
        result.push(item);
        keySet.add(key);
    }
    return result;
}

/**
 * 集合运算 B-A
 * 算出 B 集合中 A 不存在的部分
 * @param {*} allItems B —— 总集
 * @param {*} excludeItems A —— 剔除部分
 * @param {Array<string>} keys 需要同时比较的多个key
 */
export function difference(allItems, excludeItems, keys) {
    const result = [];
    const mk = (obj, ks) => { return ks.map(k => obj[k]).join("|") }
    const excludeKeys = new Set(excludeItems.map(i => mk(i, keys)));

    for (const item of allItems) {
        const myKey = mk(item, keys);
        if (!excludeKeys.has(myKey)) result.push(item);
    }
    return result;
}
