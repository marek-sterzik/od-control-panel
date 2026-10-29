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

const components = {
    "_default": AbstractComponent,
    "switch": SwitchComponent,
}

export default components
