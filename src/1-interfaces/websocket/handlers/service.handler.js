

export function registerServerHandlers(socket, services) {
    const { serviceQuery } = services;

    socket.on('Service:Runtime', async (callback) => {
        try {
            callback({ success: true, data: serviceQuery.getRuntime() });
        } catch (err) {
            callback({ success: false, message: err.message });
        }
    });
}