class MetrixSocket
{
    constructor(url, initialize, listener)
    {
        this.url = url
        this.initialize = initialize
        this.listener = listener
        this.queue = []
        this.connect()
    }

    connect()
    {
        const websocket = new WebSocket(this.url)
        this.websocket = websocket
        this.active = false
        this.websocket.addEventListener("open", (event) => this.open(event, websocket))
        this.websocket.addEventListener("error", (event) => this.error(event, websocket))
        this.websocket.addEventListener("close", (event) => this.close(event, websocket))
        this.websocket.addEventListener("message", (event) => this.message(event, websocket))
        if (this.initialize !== null && this.initialize !== undefined) {
            this.initialize.call(null, this)
        }
    }

    open(event, ws)
    {
        if (this.websocket === ws) {
            this.active = true
        }
        this.sendFromQueue()
    }

    error(event, ws)
    {
        if (this.websocket === ws) {
            this.active = false
        }
        ws.close()
    }

    close(event, ws)
    {
        this.websocket === null
        this.active = false
        setTimeout(() => this.connect(), 300)
        this.connect()
    }

    message(event, ws)
    {
        this.listener.call(null, event.data)
    }

    sendFromQueue()
    {
        if (this.queue.length > 0 && this.active) {
            const data = this.queue.shift()
            this.websocket.send(data)
        }

        if (this.queue.length > 0) {
            setTimeout(() => this.sendFromQueue(), this.active ? 0 : 100)
        }
    }

    send(data)
    {
        if (this.active && this.queue.length == 0) {
            this.websocket.send(data)
        } else {
            this.queue.push(data)
        }
    }
}


class Metrix
{
    constructor(url, initializer)
    {
        this.listeners = []
        this.initws = null
        this.socket = new MetrixSocket(url, (socket) => {
            this.socket = socket
            initializer(this)
        }, (data) => {
            const msg = Message.fromString(event.data)
            for (var listener of this.listeners) {
                listener(msg, this)
            }
        })
    }

    async send(msgType, topic, payload = null, reference = null)
    {
        const msg = new Message(msgType, topic, payload, reference)
        this.socket.send(msg.toString())
    }

    addListener(listener)
    {
        this.listeners.push(listener)
    }
}

class Message
{
    constructor(msgType, topic, payload, reference)
    {
        this.msgType = msgType
        this.topic = topic
        this.payload = payload
        this.reference = reference
        Object.freeze(this)
    }

    static fromString(string)
    {
        var data
        try {
            data = JSON.parse(string)
        } catch (e) {
            return null
        }
        const msgType = data[0]
        const topic = data[1]
        const payload = (data.length > 2) ? data[2] : null
        const reference = (data.length > 3) ? (data[3] == "" ? null : data[3]) : null
        return new Message(msgType, topic, payload, reference)
    }

    toString()
    {
        const data = [this.msgType, this.topic, this.payload, this.reference]
        if (data[3] === null) {
            data.pop()
            if (data[2] === null) {
                data.pop()
            }
        }
        return JSON.stringify(data)
    }
}

export {Metrix, Message}
