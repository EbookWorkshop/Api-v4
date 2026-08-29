export class AppError extends Error {
    /**
     * 
     * @param {string} message 错误信息
     * @param {number} [statusCode=500] 错误码缺省为500
     */
    constructor(message, statusCode = 500) {
        super(message);
        this.name = this.constructor.name;
        this.statusCode = statusCode;
        Error.captureStackTrace(this, this.constructor);
    }
}

