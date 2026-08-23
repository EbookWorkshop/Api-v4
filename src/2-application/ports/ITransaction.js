// src/2-application/ports/ITransaction.js
export class ITransaction {
    /**
     * 开始事务，并获得事务
     * @returns {Transaction} 事务对象
     */
    async begin() { throw new Error('Not implemented'); }
    /**
     * 提交事务
     */
    async commit() { throw new Error('Not implemented'); }
    /**
     * 回滚事务
     */
    async rollback() { throw new Error('Not implemented'); }
}