
const CUR_ROOM_NAME = "worker.dashboard";
let intervalHandler = -1;

let myIO = null;
let myServices = null;
let workerPool = null;

/**
 * 注册 客户端 -> 服务器的事件
 * @param {*} socket 客户端
 * @param {*} services 
 * @param {*} eventManager 
 */
export function registerSocketEvents(socket, services, eventManager) {
    socket.on('subscribe:worker.dashboard', () => { socket.join(CUR_ROOM_NAME); run(); });
    socket.on('unsubscribe:worker.dashboard', () => { socket.leave(CUR_ROOM_NAME); stop(); });
}
// function subscribeWorkerDashboard() { socket.emit('subscribe:worker.dashboard'); }
// function unsubscribeWorkerDashboard() { socket.emit('unsubscribe:worker.dashboard'); }


/**
 * 注册 服务器 -> 客户端 的广播
 * @param {*} io 服务器端
 * @param {*} services 
 * @param {*} eventManager 
 */
export function registerGlobalBroadcasts(io, services, eventManager) {
    myIO = io;
    myServices = services;
    workerPool = services.workerPool;
}


function getDataInterval() {
    //采集数据：
    const data = workerPool.getInfo();
    return myIO.to(CUR_ROOM_NAME).emit(`WorkerPool.Status`, data);
}

function run() {
    if (intervalHandler > 0) return;
    intervalHandler = setInterval(getDataInterval, 3_000);
}

function stop() {
    if (myIO.sockets.adapter.rooms.get(CUR_ROOM_NAME)?.size > 0) return;
    clearInterval(intervalHandler);
    intervalHandler = -1;
}