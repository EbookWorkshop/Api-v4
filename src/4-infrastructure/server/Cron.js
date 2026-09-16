// const cron = require('node-cron');
import cron from 'node-cron';

export class CronTimmer {

    /**
    ## 每位上格式可为：
    ###         0/5   ...  a/b —— 从 a 开始每 b 后执行一次
    ###         8-18  ...  a-b —— a 至 b 之间执行
    ###         1,3,5 ...  a,b,c —— a、b、c 在列举的时间执行
    */
    constructor({ seconds, minutes, hours, day, month, dow }) {
        this.seconds = seconds;
        this.minutes = minutes;
        this.hours = hours;
        this.day = day;
        this.month = month;
        this.dow = dow;
    }

    /**
     * 根据时间间隔生成cron表达式
     * @param {CronTimmer} param0 
     */
    timeToCron({ seconds, minutes, hours, day, month, dow }) {
        const cronArray = new Array(6).fill("*");

        if (seconds !== undefined) cronArray[0] = seconds;
        if (minutes !== undefined) cronArray[1] = minutes;
        if (hours !== undefined) cronArray[2] = hours;
        if (day !== undefined) cronArray[3] = day;
        if (month !== undefined) cronArray[4] = month;
        if (dow !== undefined) cronArray[5] = dow;

        //当日/星期其中一个设定了另一个没设定时，没设定值的标记为?，表示不关心。
        if (cronArray[3] != "*" && cronArray[5] == "*") cronArray[5] = "?";
        if (cronArray[5] != "*" && cronArray[3] == "*") cronArray[3] = "?";

        return cronArray.join(" ");
    }

    toCron() {
        return this.timeToCron(this);
    }
}

export class Cron {
    // #config
    constructor(config) {
        // this.#config = config;
    }

    /**
     * 加入一个定时作业
     * @param {string} cronText [秒] 分钟 小时 日 月 星期
     * @param {import("node-cron").TaskFn|string} func 
     */
    addCron(cronText, func) {
        try {
            return cron.schedule(cronText, func);
        } catch (error) {
            console.warn(`加入定时任务失败，表达式【${cronText}】。\n`, error);
            return null;
        }
    }

    /**
     * 
     * @param {CronTimmer} timmer 
     * @param {import("node-cron").TaskFn|string} func 
     */
    add(timmer, func) {
        if (!(timmer instanceof CronTimmer)) timmer = new CronTimmer(timmer);
        return this.addCron(timmer.toCron(), func);
    }

}

/**
cron.schedule('* * * * * *', () => {
  console.log('每秒执行一次');
}); 
 */