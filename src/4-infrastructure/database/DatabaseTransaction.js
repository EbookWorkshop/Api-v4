// src/4-infrastructure/database/DatabaseTransaction.js
import { ITransaction } from '../../2-application/ports/ITransaction.js';

export class DatabaseTransaction extends ITransaction {
    #sequelize;
    #transaction;

    constructor(sequelize) {
        super();
        this.#sequelize = sequelize;
    }

    async begin() {
        this.#transaction = await this.#sequelize.transaction();
        return this.#transaction;
    }

    async commit() {
        if (this.#transaction) await this.#transaction.commit();
    }

    async rollback() {
        if (this.#transaction) await this.#transaction.rollback();
    }

    getTransaction() {
        return this.#transaction;
    }
}

/**
 * 创建数据库事务帮助工厂
 * @param {*} sequelize 
 * @returns 
 */
export function createDatabaseTransaction(sequelize) {
    return new DatabaseTransaction(sequelize);
}