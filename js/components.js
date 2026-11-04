class AbstractComponent
{
    constructor(backend, id)
    {
        this.backend = backend
        this.id = id
    }
}

class SwitchComponent extends AbstractComponent
{
    togglePart(part)
    {
        this.backend.command({"id": this.id, "part": part, "command": "toggle"})
    }

    setPart(part)
    {
        this.backend.command({"id": this.id, "part": part, "command": "set"})
    }

    clearPart(part)
    {
        this.backend.command({"id": this.id, "part": part, "command": "clear"})
    }

    toggle()
    {
        this.togglePart("state")
    }

    set()
    {
        this.setPart("state")
    }

    clear()
    {
        this.clearPart("state")
    }

    toggleBlink()
    {
        this.togglePart("blink")
    }

    setBlink()
    {
        this.setPart("blink")
    }

    clearBlink()
    {
        this.clearPart("blink")
    }
}

class SegmentComponent extends AbstractComponent
{
    digit(i)
    {
        return new SegmentDigitComponent(this, i)
    }
}

class SegmentDigitComponent
{
    constructor(component, digit)
    {
        this.component = component
        this.digit = digit
    }

    toggle(segment)
    {
        this.component.backend.command({"id": this.component.id, "command": "toggle", "digit": this.digit, "segment": segment})
    }

    set(segment)
    {
        this.component.backend.command({"id": this.component.id, "command": "set", "digit": this.digit, "segment": segment})
    }

    clear(segment)
    {
        this.component.backend.command({"id": this.component.id, "command": "clear", "digit": this.digit, "segment": segment})
    }

    write(str)
    {
        this.component.backend.command({"id": this.component.id, "command": "write", "digit": this.digit, "string": str})
    }

    next(category = null)
    {
        this.component.backend.command({"id": this.component.id, "command": "next", "digit": this.digit, "category": category})
    }

    prev(category = null)
    {
        this.component.backend.command({"id": this.component.id, "command": "prev", "digit": this.digit, "category": category})
    }

    wipe()
    {
        this.component.backend.command({"id": this.component.id, "command": "wipe", "digit": this.digit})
    }
}


const components = {
    "_default": AbstractComponent,
    "switch": SwitchComponent,
    "segment": SegmentComponent
}

export default components
