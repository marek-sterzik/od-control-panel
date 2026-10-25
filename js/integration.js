import {Metrix, Message} from "./metrix.js"

const getMetrixUrl = () => {
    const proto = window.location.protocol === 'https:' ? 'wss://' : 'ws://';
    const host = window.location.host;
    const path = '/metrix';
    return proto + host + path
}

const metrix = new Metrix(getMetrixUrl())

const consumeMessage = (msg, metrix) => {
    console.log("got message", msg)
}

metrix.addListener(consumeMessage)
metrix.send("core", "listen", {"msg_type": "broadcast", "topic": "hello.world"})
