import {Metrix, Message} from "./metrix"
import metrixWrapper from "./metrix-wrapper"

const getMetrixUrl = () => {
    const proto = window.location.protocol === 'https:' ? 'wss://' : 'ws://';
    const host = window.location.host;
    const path = '/metrix';
    return proto + host + path
}

const socketInitialize = (metrix) => {
    metrix.send("core", "listen", {"msg_type": "broadcast", "topic": "state"})
    metrix.send("query", "state")
}

const metrix = new Metrix(getMetrixUrl(), socketInitialize)

const consumeMessage = (msg, metrix) => {
    if (msg.msgType === "broadcast" && msg.topic === "state") {
        metrixWrapper._provideState(msg.payload)
    }
}

metrixWrapper._onCommand((commands) => {
    metrix.send("write", "state", commands)
})

metrix.addListener(consumeMessage)
