export class ILogger {
    /**
     * 写入日志
     * @param {string} type error,warn,info,log,debug,none
     * @param  {...any} param 
     */
    write(type, ...param) { throw new Error('Not implemented'); }
}