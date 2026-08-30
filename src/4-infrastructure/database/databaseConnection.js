import Sequelize from 'sequelize';

/**
 * 数据库链接工厂
 * @param {*} dbPath 数据库地址
 * @param {*} logging 是否开启日志（控制台
 * @returns 
 */
export async function createDatabaseConnection(dbPath, logging = false) {
    const sequelize = new Sequelize({
        dialect: 'sqlite',
        storage: dbPath,
        logging: logging ? console.log : false,
        pool: { max: 1, min: 0, acquire: 30000, idle: 10000 },
        dialectOptions: { foreignKeys: true },
    });

    try {
        await sequelize.authenticate();// 验证连接

        await sequelize.query('PRAGMA journal_mode = WAL;');//WAL （Write-Ahead Logging）日志模式允许多个读事务与一个写事务并发执行,且写事务自动串行化
        await sequelize.query('PRAGMA synchronous = NORMAL;');//同步模式：FULL、NORMAL、OFF。（连接级的设置，需要在每次连接中设置）
        /*
        【FULL：默认，完全同步。每次提交事务将强制写入硬盘，执行最慢但最安全】
        【NORMAL：在安全与性能间取得平衡。只在少数关键时机执行强制写入。配合日志模式（WAL）性能优于FULL，同时依然能保证数据库文件不会被损坏（缺陷：若遇程序崩溃，最后提交的几个事务可能会丢失回滚）。】
        【OFF：性能最快但最危险。完全不执行强制写入，写入速度可能比FULL快几十倍，但一旦系统崩溃，数据库很可能会损坏】
        */

        // await sequelize.query('PRAGMA busy_timeout = 5000;');       //超时设置，避免写入时长时间等待锁

        // console.log(`[DB] Connected to ${dbPath} with WAL mode enabled.`);
    } catch (error) {
        console.error(`数据库连接失败： ${error.message}`);
        throw error;
    }

    return sequelize;
}
