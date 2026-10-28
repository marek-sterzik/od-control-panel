import $ from "jquery"

class MetrixWrapper
{
    constructor()
    {
        this.jQuery = $
        this.queue = []
        this.flushTimer = null
        this.flushTimeout = 10
        this.state = {}
        this.commandConsummer = null
        this.stateConsummers = []

    }

    _provideState(state)
    {
        const oldState = this.state
        this.state = {}
        for (var component of state) {
            this.state[component.id] = component
        }
        for (var callback of this.stateConsummers) {
            callback(this, this.state, oldState)
        }
    }

    _onCommand(callback)
    {
        if (this.commandConsummer !== null) {
            throw "command consummer already defined"
        }
        this.commandConsummer = callback
        this._ensureTimeout(true)
    }

    _ensureTimeout(immediately)
    {
        if (immediately) {
            if (this.flushTimer !== null) {
                clearTimeout(this.flushTimer)
                this.flushTimer = null;
            }
            this._consumeCommands()
        } else {
            if (this.flushTimer === null && this.queue.length > 0 && this.commandConsummer !== null) {
                this.flushTimer = setTimeout(() => {
                    this._consumeCommands()
                    this.flushTimer = null
                }, this.flushTimeout)
            }
        }
    }

    _consumeCommands()
    {
        if (this.queue.length > 0 && this.commandConsummer !== null) {
            const commands = this.queue
            this.queue = []
            this.commandConsummer.call(null, commands)
        }
    }


    onStateChangeRaw(callback)
    {
        this.stateConsummers.push(callback)
    }

    command(cmd)
    {
        this.queue.push(cmd)
        this._ensureTimeout(false)

    }

    toggle(id)
    {
        this.command({"id": id, "command": "toggle"})
    }

    set(id)
    {
        this.command({"id": id, "command": "set"})
    }

    clear(id)
    {
        this.command({"id": id, "command": "clear"})
    }
}

const metrix = new MetrixWrapper()

export default metrix
