import $ from "jquery"
import metrixWrapperRaw from "./metrix-wrapper-raw"
import components from "./components"
import _ from "lodash"

class MetrixWrapper
{
    constructor()
    {
        this.jQuery = $
        this.backend = metrixWrapperRaw
        this.cache = {}
        this._changeCallbacks = {}
        this._loadCallbacks = {}
        this._loaded = false
        this._firstState = null
        this._activated = false
        this.backend.onStateChange((state, oldState) => {
            if (!this._loaded) {
                return
            }
            for (var id in state) {
                const component = state[id]
                const type = component.type
                const oldComponent = (id in oldState) ? oldState[id] : null

                if (!this._activated || !_.isEqual(component, oldComponent)) {
                    const element = $("[data-metrix-id=\""+CSS.escape(id)+"\"]")
                    const event = {
                        "metrix": this,
                        "element": element,
                        "id": id,
                        "state": component,
                        "component": this.component(id)
                    }

                    var callbacks
                    if (this._activated) {
                        callbacks = this._changeCallbacks
                    } else {
                        callbacks = this._loadCallbacks
                    }

                    if (type in callbacks) {
                        for (var callback of callbacks[type]) {
                            callback(event)
                        }
                    }
                }
            }
            this._activated = true
            this._loadCallbacks = {}
        })
        $(() => {
            this._loaded = true
            this.backend.triggerConsummers()
        })
    }

    onStateChangeRaw(callback)
    {
        this.backend.onStateChange(callback)
    }

    onChange(type, callback)
    {
        if (!Array.isArray(type)) {
            type = [type]
        }
        for (var t of type) {
            if (!(t in this._changeCallbacks)) {
                this._changeCallbacks[t] = []
            }
            this._changeCallbacks[t].push(callback)
        }
    }

    onLoad(type, callback)
    {
        if (!Array.isArray(type)) {
            type = [type]
        }
        for (var t of type) {
            if (!(t in this._loadCallbacks)) {
                this._loadCallbacks[t] = []
            }
            this._loadCallbacks[t].push(callback)
        }
        if (this._activated) {
            this._activated = false
            this.backend.triggerConsummers()
        }
    }

    component(id)
    {
        const record = this.backend.getLastRecord(id)
        if (id === null) {
            return null
        }
        const type = record.type
        if ((id in this.cache) && this.cache[id][0] === type) {
            return this.cache[id][1]
        }
        var typeClass
        if (type in components) {
            typeClass = components[type]
        } else if ("_default" in components) {
            typeClass = components["_default"]
        } else {
            return null
        }
        this.cache[id] = [type, new typeClass(this.backend, id)]
        return this.cache[id][1]
    }

}

const metrix = new MetrixWrapper()

export default metrix
