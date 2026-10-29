class MetrixWrapperRaw
{
    constructor()
    {
        this.queue = []
        this.flushTimer = null
        this.flushTimeout = 10
        this.state = {}
        this.commandConsummer = null
        this.stateConsummers = []

    }

    getLastRecord(id)
    {
        if (id in this.state) {
            return this.state[id]
        } else {
            return null
        }
    }

    provideState(state)
    {
        const oldState = this.state
        this.state = {}
        for (var component of state) {
            this.state[component.id] = component
        }
        for (var callback of this.stateConsummers) {
            callback(this.state, oldState)
        }
    }

    triggerConsummers()
    {
        for (var callback of this.stateConsummers) {
            callback(this.state, this.state)
        }
    }

    onCommand(callback)
    {
        if (this.commandConsummer !== null) {
            throw "command consummer already defined"
        }
        this.commandConsummer = callback
        this.ensureTimeout(true)
    }

    ensureTimeout(immediately)
    {
        if (immediately) {
            if (this.flushTimer !== null) {
                clearTimeout(this.flushTimer)
                this.flushTimer = null;
            }
            this.consumeCommands()
        } else {
            if (this.flushTimer === null && this.queue.length > 0 && this.commandConsummer !== null) {
                this.flushTimer = setTimeout(() => {
                    this.consumeCommands()
                    this.flushTimer = null
                }, this.flushTimeout)
            }
        }
    }

    consumeCommands()
    {
        if (this.queue.length > 0 && this.commandConsummer !== null) {
            const commands = this.queue
            this.queue = []
            this.commandConsummer.call(null, commands)
        }
    }


    onStateChange(callback)
    {
        this.stateConsummers.push(callback)
    }

    command(cmd)
    {
        this.queue.push(cmd)
        this.ensureTimeout(false)

    }
}

const metrixWrapperRaw = new MetrixWrapperRaw()

export default metrixWrapperRaw

