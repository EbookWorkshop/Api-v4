// src/1-interfaces/http/dtos/email/SaveAccountRequest.dto.js
import { UserInputError } from '../../../../5-shared/errors/index.js';

/**
 * @swagger
 * components:
 *   schemas:
 *     SaveAccountRequest:
 *       type: object
 *       required:
 *         - address
 *         - password
 *       properties:
 *         address:
 *           type: string
 *           description: 发件人邮箱地址
 *           example: "sender@163.com"
 *         password:
 *           type: string
 *           description: 发件人邮箱授权密码
 *           example: "your_authorization_code"
 */
export class SaveAccountRequest {
    static fromBody(body) {
        const { address, password } = body;
        if (!address || !password) {
            throw new UserInputError('发件邮箱和授权密码为必填项');
        }
        if (!/^[^\s@]+@[^\s@]+\.[^\s@]+$/.test(address)) {
            throw new UserInputError('发件人邮箱格式不正确');
        }
        return { address, password };
    }
}