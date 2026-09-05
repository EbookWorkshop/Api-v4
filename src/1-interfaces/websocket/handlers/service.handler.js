

export function registerSocketEvents(socket, services) {
    const { serviceQuery } = services;

    /**
     * @asyncapi
     * channels:
     *   service-runtime:
     *     address: Service:Runtime
     *     messages:
     *       runtimeRequest:
     *         $ref: '#/components/messages/RuntimeRequest'
     *       runtimeResponse:
     *         $ref: '#/components/messages/RuntimeResponse'
     * operations:
     *   serviceRuntime:
     *     action: receive
     *     channel:
     *       $ref: '#/channels/service-runtime'
     *     reply:
     *       channel:
     *         $ref: '#/channels/service-runtime'
     *       messages:
     *         - $ref: '#/components/messages/RuntimeResponse'
     * components:
     *   messages:
     *     RuntimeRequest:
     *       summary: 客户端请求获取运行时信息，无负载数据。
     *       payload:
     *         type: object
     *         properties: {}
     *     RuntimeResponse:
     *       summary: 服务端响应，包含服务器运行时长（毫秒）或错误信息。
     *       payload:
     *         type: object
     *         properties:
     *           success:
     *             type: boolean
     *           data:
     *             type: number
     *             description: 服务器启动至今的毫秒数，精确到微秒（浮点数）
     *             example: 123456.789
     *           message:
     *             type: string
     *         required:
     *           - success
     */
    socket.on('Service:Runtime', async (callback) => {
        try {
            callback({ success: true, data: serviceQuery.getRuntime() });
        } catch (err) {
            callback({ success: false, message: err.message });
        }
    });
}