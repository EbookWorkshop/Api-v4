

export function registerSocketEvents(socket, services) {
    const { serviceQuery } = services;

    /**
     * @asyncapi
     * @channel Service:Runtime
     * @subscribe
     * @description 服务端监听客户端请求，获取服务运行时信息，并通过回调返回结果。
     * @request
     *   @payload {} – 客户端请求不携带任何数据负载。
     * @response
     *   @payload {object} – 服务端响应对象。
     *   @property {boolean} success – 操作是否成功。
     *   @property {object} [data] – 运行时信息对象，仅当 success 为 true 时存在。
     *   @property {string} [message] – 错误描述信息，仅当 success 为 false 时存在。
     */
    socket.on('Service:Runtime', async (callback) => {
        try {
            callback({ success: true, data: serviceQuery.getRuntime() });
        } catch (err) {
            callback({ success: false, message: err.message });
        }
    });
}