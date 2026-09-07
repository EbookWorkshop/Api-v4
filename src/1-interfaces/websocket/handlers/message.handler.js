import { MESSAGE_SEND } from '../../../2-application/constants/Event.js';



export function registerGlobalBroadcasts(io, services, eventManager) {
    eventManager.on(MESSAGE_SEND, (message) => {
        io.emit("Message.Box.Send", message);
    })
}