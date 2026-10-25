
class Metrix
{
    constructor(url)
    {
        this.websocket = new WebSocket(url)
        this.wait = new Promise((success, failure) => {
            this.websocket.addEventListener("open", (event) => {
                success()
            })
            this.websocket.addEventListener("error", (event) => {
                failure("websocket failed")
            })
        })
        this.websocket.addEventListener("message", (event) => {
            const msg = new Message(event.data)
            for (var listener of this.listeners) {
                listener(msg, this)
            }
        });
        this.listeners = []
    }

    async send(msgType, topic, payload = null, reference = null)
    {
        const msg = new Message(msgType, topic, payload, reference)
        await this.wait
        this.websocket.send(msg.toString())
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
        try {
            data = JSON.prase(string)
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
