// src/1-interfaces/http/dtos/email/SaveInboxRequest.dto.js
import { UserInputError } from '../../../../5-shared/errors/index.js';

/**
 * @swagger
 * components:
 *   schemas:
 *     SaveInboxRequest:
 *       type: object
 *       required:
 *         - address
 *       properties:
 *         address:
 *           type: string
 *           description: 默认收件邮箱地址
 *           example: "kindle@mykindle.com"
 */
export class SaveInboxRequest {
    static fromBody(body) {
        const { address } = body;
        if (!address) {
            throw new UserInputError('收件邮箱为必填项');
        }
        if (!/^[^\s@]+@[^\s@]+\.[^\s@]+$/.test(address)) {
            throw new UserInputError('收件邮箱格式不正确');
        }
        return { address };
    }
}