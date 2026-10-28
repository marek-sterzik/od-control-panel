import {Metrix, Message} from "./metrix.js"

const getMetrixUrl = () => {
    const proto = window.location.protocol === 'https:' ? 'wss://' : 'ws://';
    const host = window.location.host;
    const path = '/metrix';
    return proto + host + path
}

const metrix = new Metrix(getMetrixUrl())

const consumeMessage = (msg, metrix) => {
    if (msg.msgType === "broadcast" && msg.topic === "state") {
        console.log("broadcast state", msg.payload)
    }
}

metrix.addListener(consumeMessage)
metrix.send("core", "listen", {"msg_type": "broadcast", "topic": "state"})
metrix.send("query", "state")
