import { UserInputError } from "../../../../5-shared/errors/index.js";

export class VolumeReorderRequest {
    /**
     * @swagger
     * components:
     *   schemas:
     *     VolumeOrderItem:
     *       type: object
     *       description: 分卷排序项
     *       properties:
     *         orderNum:
     *           type: integer
     *           description: 新的排序序号
     *           example: 1
     *         volumeId:
     *           type: integer
     *           description: 分卷 ID
     *           example: 2
     *       required:
     *         - orderNum
     *         - volumeId
     *
     *     VolumeReorderRequest:
     *       type: object
     *       description: 分卷重排序请求体
     *       properties:
     *         volumeOrders:
     *           type: array
     *           items:
     *             $ref: '#/components/schemas/VolumeOrderItem'
     *           description: 分卷排序列表
     *       required:
     *         - volumeOrders
     *
     *   examples:
     *     VolumeReorderRequestExample:
     *       summary: 分卷重排序请求示例
     *       value:
     *         volumeOrders:
     *           - orderNum: 1
     *             volumeId: 2
     *           - orderNum: 3
     *             volumeId: 3
     *           - orderNum: 4
     *             volumeId: 4
     */
    static fromBody(body) {
        const { volumeOrders } = body;
        const errNum = volumeOrders.some(item => isNaN(item.orderNum) || isNaN(item.volumeId));
        if (volumeOrders.length == 0 || errNum.length > 0) throw new UserInputError("volumeOrders 必须为非空数组，且每个元素需包含 orderNum 和 volumeId");
        return volumeOrders;
    }
}