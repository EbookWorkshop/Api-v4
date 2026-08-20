export class UserInputError extends Error {
  /**
   * 用户输入（引发）的错误
   * @param {*} message 
   * @param {*} statusCode 
   */
  constructor(message, statusCode = 600) {
    super(message);
    this.name = this.constructor.name;
    this.statusCode = statusCode;
    Error.captureStackTrace(this, this.constructor);
  }
}

