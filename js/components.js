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
    toggle()
    {
        this.backend.command({"id": this.id, "command": "toggle"})
    }

    set()
    {
        this.backend.command({"id": this.id, "command": "set"})
    }

    clear()
    {
        this.backend.command({"id": this.id, "command": "clear"})
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

    next()
    {
        this.component.backend.command({"id": this.component.id, "command": "next", "digit": this.digit})
    }

    prev()
    {
        this.component.backend.command({"id": this.component.id, "command": "prev", "digit": this.digit})
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
