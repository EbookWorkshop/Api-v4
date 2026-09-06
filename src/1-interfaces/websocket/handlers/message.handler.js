import { MESSAGE_SEND } from '../../../3-domain/constants/Event.js';



export function registerGlobalBroadcasts(io, services, eventManager) {
    eventManager.on(MESSAGE_SEND, (message) => {
        io.emit("Message.Box.Send", message);
    })
}